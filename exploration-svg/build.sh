rm -rf ../build
mkdir -p ../build
node_modules/.bin/browserify index.js > ../build/bundle.js
cp index.css ../build/
cp reset.css ../build/
cp index.html ../build/
cp -r data ../build/
cp .now.json ../build/package.json
