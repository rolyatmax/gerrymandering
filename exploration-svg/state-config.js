export default {
  al: {
    projectionRotation: [86.5, -33 - 45 / 60],
    dimensions: ['normal-votes', 'pres-2008', 'us-senate-2008'],
    dataSources: {
      precincts: 'al-precincts.json',
      districts: [
        { name: 'US Districts 2010', filename: 'al-congressional-districts-2010-simplified.json' },
        { name: 'US Districts 2015', filename: 'al-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: 'US Districts 2010', filename: 'district-totals/al-congressional-districts-2010-totals.csv' },
        { name: 'US Districts 2015', filename: 'district-totals/al-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  az: {
    projectionRotation: [111.5, -34.5 - 45 / 60],
    dimensions: ['normal-votes', 'gov-2010', 'pres-2008', 'us-senate-2010'],
    dataSources: {
      precincts: 'az-precincts.json',
      districts: [
        { name: 'US Districts 2010', filename: 'az-congressional-districts-2010-simplified.json' },
        { name: 'US Districts 2015', filename: 'az-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: 'US Districts 2010', filename: 'district-totals/az-congressional-districts-2010-totals.csv' },
        { name: 'US Districts 2015', filename: 'district-totals/az-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  ia: {
    projectionRotation: [93.5, -42 - 45 / 60],
    dimensions: ['normal-votes', 'us-house-2008', 'pres-2008', 'us-senate-2008'],
    dataSources: {
      precincts: 'ia-precincts.json',
      districts: [
        { name: 'US Districts 2010', filename: 'ia-congressional-districts-2010-simplified.json' },
        { name: 'US Districts 2015', filename: 'ia-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: 'US Districts 2010', filename: 'district-totals/ia-congressional-districts-2010-totals.csv' },
        { name: 'US Districts 2015', filename: 'district-totals/ia-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  fl: {
    projectionRotation: [84, -27.5 - 45 / 60],
    dimensions: ['normal-votes', 'gov-2010', 'pres-2008', 'us-senate-2010'],
    dataSources: {
      precincts: 'az-precincts.json',
      districts: [
        { name: 'US Districts 2010', filename: 'fl-congressional-districts-2010-simplified.json' },
        { name: 'US Districts 2015', filename: 'fl-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: 'US Districts 2010', filename: 'district-totals/fl-congressional-districts-2010-totals.csv' },
        { name: 'US Districts 2015', filename: 'district-totals/fl-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  nc: {
    projectionRotation: [79, -33 - 45 / 60],
    dimensions: ['gov-2008', 'party-affiliation', 'pres-2008', 'us-senate-2008', 'us-senate-2010'],
    dataSources: {
      precincts: 'nc-precincts.json',
      districts: [
        { name: 'US Districts 2010', filename: 'nc-congressional-districts-2010-simplified.json' },
        { name: 'US Districts 2013', filename: 'nc-congressional-districts-2013-simplified.json' },
        { name: 'US Districts 2015', filename: 'nc-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: 'US Districts 2010', filename: 'district-totals/nc-congressional-districts-2010-totals.csv' },
        { name: 'US Districts 2013', filename: 'district-totals/nc-congressional-districts-2013-totals.csv' },
        { name: 'US Districts 2015', filename: 'district-totals/nc-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  tx: {
    projectionRotation: [98.5, -31 - 45 / 60],
    dimensions: ['gov-2010', 'normal-votes', 'pres-2008'],
    dataSources: {
      precincts: 'tx-precincts.json',
      districts: [
        { name: 'US Districts 2010', filename: 'tx-congressional-districts-2010-simplified.json' },
        { name: 'US Districts 2015', filename: 'tx-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: 'US Districts 2010', filename: 'district-totals/tx-congressional-districts-2010-totals.csv' },
        { name: 'US Districts 2015', filename: 'district-totals/tx-congressional-districts-2015-totals.csv' }
      ]
    }
  }
}
