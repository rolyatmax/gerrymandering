rm -rf ../build
mkdir -p ../build
node_modules/.bin/browserify index.js > ../build/bundle.js
gzip -9 ../build/bundle.js
cp index.css ../build/
cp reset.css ../build/
cp index.html ../build/
cp state-config.js ../build/
cp helpers.js ../build/
ln -s ../data ../build/data
cp .now.json ../build/package.json
