# NC
# node calculate-district-totals.js ../points/nc-us-senate-2010-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-us-senate-2010-by-congressional-districts-2010.csv
# echo "completed job 1"
# node calculate-district-totals.js ../points/nc-us-senate-2008-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-us-senate-2008-by-congressional-districts-2010.csv
# echo "completed job 2"
# node calculate-district-totals.js ../points/nc-gen-pop-ethnicity-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-gen-pop-ethnicity-by-congressional-districts-2010.csv
# echo "completed job 3"
# node calculate-district-totals.js ../points/nc-gen-pop-race-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-gen-pop-race-by-congressional-districts-2010.csv
# echo "completed job 4"
# node calculate-district-totals.js ../points/nc-gov-2008-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-gov-2008-by-congressional-districts-2010.csv
# echo "completed job 5"
# node calculate-district-totals.js ../points/nc-pres-2008-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-pres-2008-by-congressional-districts-2010.csv
# echo "completed job 6"
# node calculate-district-totals.js ../points/nc-voter-age-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-voter-age-by-congressional-districts-2010.csv
# echo "completed job 7"
# node calculate-district-totals.js ../points/nc-voter-gender-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-voter-gender-by-congressional-districts-2010.csv
# echo "completed job 8"
# node calculate-district-totals.js ../points/nc-voter-party-points-resolution5.csv ../nc-congressional-districts-2010-simplified.json 5 2 > ../district-totals/nc-voter-party-by-congressional-districts-2010.csv
# echo "completed job 9"

# TX
# node calculate-district-totals.js ../points/tx-normal-votes-points-resolution2.csv ../tx-congressional-districts-2010-simplified.json 2 5 > ../district-totals/tx-normal-votes-by-congressional-districts-2010.csv
# echo "completed job 1"
# node calculate-district-totals.js ../points/tx-pres-2008-points-resolution2.csv ../tx-congressional-districts-2010-simplified.json 2 5 > ../district-totals/tx-pres-2008-by-congressional-districts-2010.csv
# echo "completed job 2"
# node calculate-district-totals.js ../points/tx-gov-2010-points-resolution2.csv ../tx-congressional-districts-2010-simplified.json 2 5 > ../district-totals/tx-gov-2010-by-congressional-districts-2010.csv
# echo "completed job 3"

# AZ
node calculate-district-totals.js ../points/az-gov-2010-points-resolution2.csv ../az-congressional-districts-2015-simplified.json 2 5 > ../district-totals/az-gov-2010-by-congressional-districts-2015.csv
echo "completed job 1"
node calculate-district-totals.js ../points/az-normal-votes-points-resolution2.csv ../az-congressional-districts-2015-simplified.json 2 5 > ../district-totals/az-normal-votes-by-congressional-districts-2015.csv
echo "completed job 2"
node calculate-district-totals.js ../points/az-pres-2008-points-resolution2.csv ../az-congressional-districts-2015-simplified.json 2 5 > ../district-totals/az-pres-2008-by-congressional-districts-2015.csv
echo "completed job 3"
node calculate-district-totals.js ../points/az-us-senate-2010-points-resolution2.csv ../az-congressional-districts-2015-simplified.json 2 5 > ../district-totals/az-us-senate-2010-by-congressional-districts-2015.csv
echo "completed job 4"
