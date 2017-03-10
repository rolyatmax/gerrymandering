node calculate-district-totals.js ../points/nc-us-senate-2010-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-us-senate-2010-by-congressional-districts-2010.csv
echo "completed job 1"
node calculate-district-totals.js ../points/nc-us-senate-2008-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-us-senate-2008-by-congressional-districts-2010.csv
echo "completed job 2"
node calculate-district-totals.js ../points/nc-gen-pop-ethnicity-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-gen-pop-ethnicity-by-congressional-districts-2010.csv
echo "completed job 3"
node calculate-district-totals.js ../points/nc-gen-pop-race-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-gen-pop-race-by-congressional-districts-2010.csv
echo "completed job 4"
node calculate-district-totals.js ../points/nc-gov-2008-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-gov-2008-by-congressional-districts-2010.csv
echo "completed job 5"
node calculate-district-totals.js ../points/nc-pres-2008-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-pres-2008-by-congressional-districts-2010.csv
echo "completed job 6"
node calculate-district-totals.js ../points/nc-voter-age-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-voter-age-by-congressional-districts-2010.csv
echo "completed job 7"
node calculate-district-totals.js ../points/nc-voter-gender-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-voter-gender-by-congressional-districts-2010.csv
echo "completed job 8"
node calculate-district-totals.js ../points/nc-voter-party-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-voter-party-by-congressional-districts-2010.csv
echo "completed job 9"
