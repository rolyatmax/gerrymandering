# Steps to get vote data for a new state:

1. Download state precinct data from Harvard Dataverse
2. Load into mapshaper and simplify geometry - save as `{state_abbrev}_final.json`
3. Use `clean-precinct-data.js` to filter down to just the relevant properties - save as `{state_abbrev}-precincts.json`
  - Use mapshaper to look at each set of properties and determine the important dimensions
4. Filter out state districts from us congressional district 2010/2015 maps using `filter-congressional-districts.js`
  - update the STATEFP/STATEFP10 code in the JS
5. Generate points with `make-points`
  - Make sure the dimensions are in the validPropGroups list in `generate-points.js`
6. Use those generated points to determine counts for each map's districts for each dimension with `calculate-totals`
7. Merge all the dimension totals by district year
8. Delete the original district-totals files that have been merged
9. Update state-config with paths to district-totals and a projection rotation

# Steps to get demo data for 2010 census tract

1. Download tract shapefile from [this page](https://www.census.gov/geo/maps-data/data/cbf/cbf_tracts.html)
2. Use mapshaper to convert to geojson (and possibly simplify geometry) - save as `{state_abbrev}-census-tracts-2010.json`
3. Download demo data from US Census API for the state and variables you want. See `fetch-demo-example.sh`
4. Use `merge-tracts-with-demo.js` to stick all the demographic data on the geojson properties. See `merge-tracts-with-demo-example.sh`
5. Use `rename-geojson-props.js` to rename the demographic props if you'd like. See `rename-geojson-prop-example.sh`
