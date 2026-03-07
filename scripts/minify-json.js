const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/assets/db');

const shouldWrite = process.argv.includes('--write');

function minifyJsonFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);
    let totalFiles = 0;
    let originalSize = 0;
    let newSize = 0;

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            const result = minifyJsonFiles(filePath);
            if (result) {
                totalFiles += result.totalFiles;
                originalSize += result.originalSize;
                newSize += result.newSize;
            }
        } else if (file.endsWith('.json')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const json = JSON.parse(content);
                const minified = JSON.stringify(json);
                const minifiedSize = Buffer.byteLength(minified, 'utf8'); // More accurate size
                
                if (shouldWrite) {
                    fs.writeFileSync(filePath, minified);
                }
                
                totalFiles++;
                originalSize += stat.size;
                newSize += minifiedSize;
            } catch (err) {
                console.error(`Error processing ${filePath}:`, err.message);
            }
        }
    }

    return { totalFiles, originalSize, newSize };
}

console.log(`Starting JSON minification... ${shouldWrite ? '(Writing changes)' : '(Dry Run)'}`);
const result = minifyJsonFiles(targetDir);

if (result) {
    console.log(`\nMinification complete!`);
    console.log(`Total files processed: ${result.totalFiles}`);
    console.log(`Original size: ${(result.originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`New size: ${(result.newSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Saved: ${((result.originalSize - result.newSize) / 1024 / 1024).toFixed(2)} MB`);
}
