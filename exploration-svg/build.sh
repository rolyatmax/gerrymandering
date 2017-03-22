rm -rf ../docs
mkdir -p ../docs
node_modules/.bin/browserify index.js > ../docs/bundle.js
cp index.css ../docs/
cp reset.css ../docs/
cp index.html ../docs/
cp state-config.js ../docs/
cp helpers.js ../docs/
ln -s ../data ../docs/data
