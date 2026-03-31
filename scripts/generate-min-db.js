const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const assetsRoot = path.join(projectRoot, 'src', 'assets');
const topicDir = path.join(assetsRoot, 'topic');
const dbDir = path.join(assetsRoot, 'db');
const dbMinDir = path.join(assetsRoot, 'db-min');

function readJson(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`Failed to read JSON: ${filePath}`, err.message);
        return null;
    }
}

function collectPoemRefsFromNode(node, refs) {
    if (!node) return;

    if (Array.isArray(node)) {
        for (const item of node) {
            collectPoemRefsFromNode(item, refs);
        }
        return;
    }

    if (typeof node === 'object') {
        // 诗引用的一般结构：{ id: string, title: string, author: string, sample: string }
        if (
            typeof node.id === 'string' &&
            typeof node.title === 'string' &&
            typeof node.author === 'string'
        ) {
            if (!refs.has(node.id)) {
                refs.set(node.id, {
                    id: node.id,
                    title: node.title,
                    author: node.author,
                });
            }
        }

        for (const value of Object.values(node)) {
            collectPoemRefsFromNode(value, refs);
        }
    }
}

function collectPoemReferences() {
    const refs = new Map(); // id -> { id, title, author }

    if (!fs.existsSync(topicDir)) {
        console.error(`Topic directory not found: ${topicDir}`);
        return refs;
    }

    const files = fs.readdirSync(topicDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(topicDir, file);
        const json = readJson(filePath);
        if (!json) continue;

        collectPoemRefsFromNode(json, refs);
    }

    console.log(`Collected ${refs.size} unique poem references from topic JSON files.`);
    return refs;
}

function isPoem(obj) {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        Array.isArray(obj.paragraphs)
    );
}

function isAuthor(obj) {
    return obj && typeof obj === 'object' && typeof obj.name === 'string';
}

function walkDir(dir, visitor) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath, visitor);
        } else if (entry.endsWith('.json')) {
            visitor(fullPath);
        }
    }
}

function collectPoems(poemIdSet) {
    const poemsById = new Map();

    walkDir(dbDir, filePath => {
        const json = readJson(filePath);
        if (!json || !Array.isArray(json)) return;

        for (const item of json) {
            if (!isPoem(item)) continue;
            const id = item.id;
            if (poemIdSet.has(id) && !poemsById.has(id)) {
                poemsById.set(id, item);
            }
        }
    });

    console.log(`Collected ${poemsById.size} poems from db matching topic references.`);

    const missing = [];
    for (const id of poemIdSet) {
        if (!poemsById.has(id)) missing.push(id);
    }
    if (missing.length > 0) {
        console.warn(`WARNING: ${missing.length} poem ids referenced in topics were not found in db.`);
        // 打印前几十个方便排查
        console.warn(missing.slice(0, 50));
    }

    return poemsById;
}

function collectAuthorsFromDb(authorNameSet) {
    const authorsByName = new Map();

    walkDir(dbDir, filePath => {
        const fileName = path.basename(filePath).toLowerCase();
        // 只在包含 author 的文件里找作者元数据
        if (!fileName.includes('author')) return;

        const json = readJson(filePath);
        if (!json || !Array.isArray(json)) return;

        for (const item of json) {
            if (!isAuthor(item)) continue;
            const name = item.name;
            if (authorNameSet.has(name) && !authorsByName.has(name)) {
                authorsByName.set(name, item);
            }
        }
    });

    console.log(`Collected ${authorsByName.size} authors from db matching minimal poems.`);

    const missing = [];
    for (const name of authorNameSet) {
        if (!authorsByName.has(name)) missing.push(name);
    }
    if (missing.length > 0) {
        console.warn(`NOTE: ${missing.length} authors used in minimal poems have no entry in any authors*.json file.`);
        console.warn(missing.slice(0, 50));
    }

    return authorsByName;
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function main() {
    console.log('=== Generating minimal DB (poems.min.json & authors.min.json) ===');
    console.log(`Project root: ${projectRoot}`);

    const poemRefs = collectPoemReferences();
    const poemIdSet = new Set(poemRefs.keys());

    if (poemIdSet.size === 0) {
        console.error('No poem references found in topic JSON. Abort.');
        process.exit(1);
    }

    const poemsById = collectPoems(poemIdSet);

    if (poemsById.size === 0) {
        console.error('No poems collected from db. Abort.');
        process.exit(1);
    }

    const authorNameSet = new Set();
    for (const poem of poemsById.values()) {
        if (poem.author) {
            authorNameSet.add(poem.author);
        }
    }

    // 也把 topic 里带 author 的引用作者名加进去，防止某些诗在 db 里没有 author 字段
    for (const ref of poemRefs.values()) {
        if (ref.author) authorNameSet.add(ref.author);
    }

    console.log(`Total distinct authors referenced by minimal poems: ${authorNameSet.size}`);

    const authorsByName = collectAuthorsFromDb(authorNameSet);

    ensureDir(dbMinDir);

    const poemsMinPath = path.join(dbMinDir, 'poems.min.json');
    const authorsMinPath = path.join(dbMinDir, 'authors.min.json');

    const poemsArray = Array.from(poemsById.values());
    const authorsArray = Array.from(authorsByName.values());

    fs.writeFileSync(poemsMinPath, JSON.stringify(poemsArray, null, 2), 'utf8');
    fs.writeFileSync(authorsMinPath, JSON.stringify(authorsArray, null, 2), 'utf8');

    console.log('--- Done ---');
    console.log(`Wrote ${poemsArray.length} poems to ${poemsMinPath}`);
    console.log(`Wrote ${authorsArray.length} authors to ${authorsMinPath}`);
}

if (require.main === module) {
    main();
}
