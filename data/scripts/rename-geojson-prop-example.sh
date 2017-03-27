node rename-geojson-props.js ../ny-census-tracts-2010.json \
  -c P0030002=race:white \
  -c P0030003=race:black \
  -c P0030004=race:native-american \
  -c P0030005=race:asian \
  -c P0030006=race:pacific-islander \
  -c P0030007=race:other \
  -c P0030008=race:two-or-more \
  -c P0040002=ethnicity:non-hispanic \
  -c P0040003=ethnicity:hispanic > tmp && mv tmp ../ny-census-tracts-2010.json
