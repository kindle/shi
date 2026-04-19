const fs = require('fs');
const path = require('path');
const https = require('https');

const DEFAULT_ZOOM = 5;
const BOUNDS = {
  minLat: 18,
  maxLat: 54,
  minLng: 73,
  maxLng: 135,
};
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

function downloadTile(url, outputFile) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'shi-offline-tile-downloader/1.0 (contact: shi.reddah.com)',
      },
    }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed ${url}, status ${response.statusCode}`));
        return;
      }

      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
      const stream = fs.createWriteStream(outputFile);
      response.pipe(stream);

      stream.on('finish', () => {
        stream.close(() => resolve());
      });

      stream.on('error', (error) => {
        stream.destroy();
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
  const tasks = [];

  for (let x = range.xMin; x <= range.xMax; x += 1) {
    for (let y = range.yMin; y <= range.yMax; y += 1) {
      tasks.push({ x, y });
    }
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

    const url = `https://tile.openstreetmap.org/${zoom}/${task.x}/${task.y}.png`;

    try {
      await downloadTile(url, outputFile);
      downloaded += 1;
      process.stdout.write(`\rDownloaded ${downloaded}/${tasks.length}, skipped ${skipped}`);
      await sleep(80);
    } catch (error) {
      console.error(`\nSkip tile ${zoom}/${task.x}/${task.y}: ${error.message}`);
    }
  }

  console.log(`\nDone. downloaded=${downloaded}, skipped=${skipped}, total=${tasks.length}`);
  console.log(`Tiles saved in ${OUTPUT_ROOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
