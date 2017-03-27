curl "http://api.census.gov/data/2010/sf1?key=[API_KEY]&get=P0030002,P0030003,P0030004,P0030005,P0030006,P0030007,P0030008,P0040002,P0040003&in=state:53+county:*&for=tract:*" > wa-demo-by-tract.json
curl "http://api.census.gov/data/2010/sf1?key=[API_KEY]&get=P0030002,P0030003,P0030004,P0030005,P0030006,P0030007,P0030008,P0040002,P0040003&in=state:34+county:*&for=tract:*" > nj-demo-by-tract.json
