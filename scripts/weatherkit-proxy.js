#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.WEATHERKIT_PROXY_PORT || 8787);
const HOST = process.env.WEATHERKIT_PROXY_HOST || '127.0.0.1';
const WEATHERKIT_BASE = 'https://weatherkit.apple.com';

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

function toBase64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function readPrivateKey(privateKeyPath) {
  const resolved = path.resolve(privateKeyPath);
  return fs.readFileSync(resolved, 'utf8');
}

function buildWeatherKitToken() {
  const teamId = required('WEATHERKIT_TEAM_ID');
  const keyId = required('WEATHERKIT_KEY_ID');
  const serviceId = required('WEATHERKIT_SERVICE_ID');
  const privateKeyPath = required('WEATHERKIT_PRIVATE_KEY_PATH');
  const privateKey = readPrivateKey(privateKeyPath);

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 20;

  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
    id: `${teamId}.${serviceId}`,
  };

  const payload = {
    iss: teamId,
    iat: now,
    exp,
    sub: serviceId,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.sign('sha256', Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });

  return `${signingInput}.${toBase64Url(signature)}`;
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(payload));
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractPrecipitationMm(hourItem) {
  const amountValue = hourItem?.precipitationAmount?.value;
  if (Number.isFinite(amountValue)) {
    return Math.max(0, amountValue);
  }

  const chance = Number.isFinite(hourItem?.precipitationChance) ? hourItem.precipitationChance : 0;
  return Math.max(0, chance * 3);
}

async function fetchWeatherKitForecast(lat, lng, timezone, language) {
  const token = buildWeatherKitToken();
  const query = new URLSearchParams({
    dataSets: 'forecastHourly',
    timezone,
  });

  const endpoint = `${WEATHERKIT_BASE}/api/v1/weather/${encodeURIComponent(language)}/${lat}/${lng}?${query.toString()}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WeatherKit ${response.status}: ${text}`);
  }

  return response.json();
}

function mapToOpenMeteoShape(weatherKitJson, pastHours, forecastHours) {
  const hours = Array.isArray(weatherKitJson?.forecastHourly?.hours)
    ? weatherKitJson.forecastHourly.hours
    : [];

  const futureSeries = hours.map((item) => extractPrecipitationMm(item));
  const fallbackFirst = futureSeries.length ? futureSeries[0] : 0;
  const pastSeries = Array.from({ length: Math.max(0, pastHours) }, () => fallbackFirst);

  const totalTarget = Math.max(1, pastHours + forecastHours);
  const merged = [...pastSeries, ...futureSeries].slice(0, totalTarget);

  while (merged.length < totalTarget) {
    merged.push(merged.length ? merged[merged.length - 1] : 0);
  }

  return {
    hourly: {
      precipitation: merged,
    },
  };
}

async function handleForecast(req, res, url) {
  const lat = parseNumber(url.searchParams.get('latitude'), NaN);
  const lng = parseNumber(url.searchParams.get('longitude'), NaN);
  const pastHours = parseNumber(url.searchParams.get('past_hours'), 1);
  const forecastHours = parseNumber(url.searchParams.get('forecast_hours'), 48);
  const timezone = (url.searchParams.get('timezone') || 'Asia/Shanghai').trim();
  const language = (url.searchParams.get('language') || 'zh-Hans').trim();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    writeJson(res, 400, { error: 'Invalid latitude or longitude' });
    return;
  }

  try {
    const forecastJson = await fetchWeatherKitForecast(lat, lng, timezone, language);
    const normalized = mapToOpenMeteoShape(forecastJson, pastHours, forecastHours);
    writeJson(res, 200, normalized);
  } catch (error) {
    writeJson(res, 502, {
      error: 'Failed to fetch WeatherKit forecast',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    writeJson(res, 400, { error: 'Missing URL' });
    return;
  }

  if (req.method === 'OPTIONS') {
    writeJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/healthz') {
    writeJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/v1/forecast') {
    await handleForecast(req, res, url);
    return;
  }

  writeJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`WeatherKit proxy running at http://${HOST}:${PORT}`);
  // eslint-disable-next-line no-console
  console.log('Set WEATHERKIT_TEAM_ID, WEATHERKIT_KEY_ID, WEATHERKIT_SERVICE_ID, WEATHERKIT_PRIVATE_KEY_PATH before using /v1/forecast');
});
