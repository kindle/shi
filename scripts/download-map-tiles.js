const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const DEFAULT_ZOOM = 5;
const BOUNDS = {
  minLat: 18,
  maxLat: 54,
  minLng: 73,
  maxLng: 135,
};
const EXTRA_TILES_BY_ZOOM = {
  6: [{ x: 43, y: 23 }],
};
const TILE_SOURCES = [
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
  'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
];
const BLOCKED_TILE_HASHES = new Set([
  'b02c44252dac5a5e820ecef1e9bf9200e9407c042df668a466a1aa81a9ecca7a',
]);
const OUTPUT_ROOT = path.resolve(__dirname, '../src/assets/map');

function latLngToTile(lat, lng, zoom) {
  const scale = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * scale);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2) * scale,
  );

  return { x, y };
}

function getTileRange(zoom) {
  const topLeft = latLngToTile(BOUNDS.maxLat, BOUNDS.minLng, zoom);
  const bottomRight = latLngToTile(BOUNDS.minLat, BOUNDS.maxLng, zoom);

  return {
    xMin: Math.min(topLeft.x, bottomRight.x),
    xMax: Math.max(topLeft.x, bottomRight.x),
    yMin: Math.min(topLeft.y, bottomRight.y),
    yMax: Math.max(topLeft.y, bottomRight.y),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTileUrl(template, zoom, x, y) {
  return template
    .replace('{z}', String(zoom))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
}

function downloadTile(url, outputFile) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'shi-offline-tile-downloader/1.1 (+https://shi.reddah.com/; contact: shi@reddah.com)',
        Referer: 'https://shi.reddah.com/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed ${url}, status ${response.statusCode}`));
        return;
      }

      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        if (BLOCKED_TILE_HASHES.has(hash)) {
          reject(new Error(`Blocked tile payload from ${url}`));
          return;
        }

        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        fs.writeFileSync(outputFile, buffer);
        resolve();
      });

      response.on('error', (error) => {
        reject(error);
      });
    });

    request.on('error', reject);
  });
}

async function main() {
  const zoomArg = Number(process.argv[2]);
  const zoom = Number.isInteger(zoomArg) ? zoomArg : DEFAULT_ZOOM;

  const range = getTileRange(zoom);
  const taskKeys = new Set();
  const tasks = [];

  function addTask(x, y) {
    const key = `${x}/${y}`;
    if (taskKeys.has(key)) {
      return;
    }

    taskKeys.add(key);
    tasks.push({ x, y });
  }

  for (let x = range.xMin; x <= range.xMax; x += 1) {
    for (let y = range.yMin; y <= range.yMax; y += 1) {
      addTask(x, y);
    }
  }

  for (const tile of EXTRA_TILES_BY_ZOOM[zoom] || []) {
    addTask(tile.x, tile.y);
  }

  console.log(`Downloading ${tasks.length} tiles for zoom ${zoom}...`);

  let downloaded = 0;
  let skipped = 0;

  for (const task of tasks) {
    const outputFile = path.join(OUTPUT_ROOT, String(zoom), String(task.x), `${task.y}.png`);

    if (fs.existsSync(outputFile)) {
      skipped += 1;
      continue;
    }

    let lastError;

    for (const template of TILE_SOURCES) {
      const url = buildTileUrl(template, zoom, task.x, task.y);

      try {
        await downloadTile(url, outputFile);
        downloaded += 1;
        process.stdout.write(`\rDownloaded ${downloaded}/${tasks.length}, skipped ${skipped}`);
        await sleep(80);
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      console.error(`\nSkip tile ${zoom}/${task.x}/${task.y}: ${lastError.message}`);
    }
  }

  console.log(`\nDone. downloaded=${downloaded}, skipped=${skipped}, total=${tasks.length}`);
  console.log(`Tiles saved in ${OUTPUT_ROOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
