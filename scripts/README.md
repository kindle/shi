How to use the script
I have added a command to your package.json. You can perform a dry run (check savings without modifying files) by running:

npm run minify-assets

example:
bailinwei@Bailins-MBP scripts % npm run minify-assets
> shi@1.8.0 minify-assets
> node scripts/minify-json.js

Starting JSON minification... (Dry Run)

Minification complete!
Total files processed: 1282
Original size: 167.22 MB
New size: 123.62 MB
Saved: 43.61 MB


To apply the changes and overwrite the files with the compressed versions, run:

node scripts/minify-json.js --write

---------------------------------------------------
How to fix content bugs
1.update shi/db content
2.copy db shi/db to shi/assets/db
3.run node scripts/minify-json.js --write 
to minify all the json files

