const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');

const targetDir = path.join(__dirname, '../src/assets/db');
const shouldWrite = process.argv.includes('--write');
const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

function detectIndentation(content) {
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const match = line.match(/^(\s+)\S/);
        if (!match) {
            continue;
        }

        return match[1];
    }

    return '    ';
}

function detectTrailingNewline(content) {
    if (content.endsWith('\r\n')) {
        return '\r\n';
    }

    if (content.endsWith('\n')) {
        return '\n';
    }

    return '';
}

function detectNewline(content) {
    return content.includes('\r\n') ? '\r\n' : '\n';
}

function convertNode(node, stats) {
    if (typeof node === 'string') {
        const converted = converter(node);
        if (converted !== node) {
            stats.changedStrings += 1;
        }
        return converted;
    }

    if (Array.isArray(node)) {
        let changed = false;
        const convertedArray = node.map(item => {
            const convertedItem = convertNode(item, stats);
            if (convertedItem !== item) {
                changed = true;
            }
            return convertedItem;
        });

        return changed ? convertedArray : node;
    }

    if (node && typeof node === 'object') {
        let changed = false;
        const convertedObject = {};

        for (const [key, value] of Object.entries(node)) {
            const convertedValue = convertNode(value, stats);
            if (convertedValue !== value) {
                changed = true;
            }
            convertedObject[key] = convertedValue;
        }

        return changed ? convertedObject : node;
    }

    return node;
}

function processJsonFiles(dir, stats) {
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        process.exitCode = 1;
        return;
    }

    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const entryStat = fs.statSync(fullPath);

        if (entryStat.isDirectory()) {
            processJsonFiles(fullPath, stats);
            continue;
        }

        if (!entry.endsWith('.json')) {
            continue;
        }

        stats.totalFiles += 1;

        try {
            const originalContent = fs.readFileSync(fullPath, 'utf8');
            const json = JSON.parse(originalContent);
            const convertedJson = convertNode(json, stats);
            const contentChanged = convertedJson !== json;

            if (contentChanged) {
                stats.changedFiles += 1;
                stats.changedPaths.push(path.relative(path.join(__dirname, '..'), fullPath));

                if (shouldWrite) {
                    const indentation = detectIndentation(originalContent);
                    const trailingNewline = detectTrailingNewline(originalContent);
                    const newline = detectNewline(originalContent);
                    const convertedContent = JSON.stringify(convertedJson, null, indentation)
                        .replace(/\n/g, newline);

                    fs.writeFileSync(fullPath, convertedContent + trailingNewline, 'utf8');
                }
            }
        } catch (error) {
            stats.errors.push({
                filePath: fullPath,
                message: error.message,
            });
        }
    }
}

function main() {
    const stats = {
        totalFiles: 0,
        changedFiles: 0,
        changedStrings: 0,
        changedPaths: [],
        errors: [],
    };

    console.log(`Starting Traditional-to-Simplified conversion... ${shouldWrite ? '(Writing changes)' : '(Dry Run)'}`);
    processJsonFiles(targetDir, stats);

    console.log(`\nConversion complete.`);
    console.log(`Total files scanned: ${stats.totalFiles}`);
    console.log(`Files with text changes: ${stats.changedFiles}`);
    console.log(`Changed strings: ${stats.changedStrings}`);

    if (stats.changedPaths.length > 0) {
        console.log('\nSample changed files:');
        for (const filePath of stats.changedPaths.slice(0, 20)) {
            console.log(`- ${filePath}`);
        }
        if (stats.changedPaths.length > 20) {
            console.log(`... and ${stats.changedPaths.length - 20} more files.`);
        }
    }

    if (stats.errors.length > 0) {
        console.log('\nErrors:');
        for (const error of stats.errors) {
            console.log(`- ${error.filePath}: ${error.message}`);
        }
        process.exitCode = 1;
    }
}

main();