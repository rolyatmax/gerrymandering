export default {
  al: {
    projectionRotation: [86.5, -33],
    races: ['normal-votes', 'pres-2008', 'us-senate-2008'],
    dataSources: {
      tracts: 'al-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'al-congressional-districts-2010-simplified.json' },
        { name: '2015', filename: 'al-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/al-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/al-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  az: {
    projectionRotation: [111.5, -34.5],
    races: ['normal-votes', 'gov-2010', 'pres-2008', 'us-senate-2010'],
    dataSources: {
      tracts: 'az-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'az-congressional-districts-2010-simplified.json' },
        { name: '2015', filename: 'az-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/az-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/az-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  ia: {
    projectionRotation: [93.5, -42],
    races: ['normal-votes', 'us-house-2008', 'pres-2008', 'us-senate-2008'],
    dataSources: {
      tracts: 'ia-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'ia-congressional-districts-2010-simplified.json' },
        { name: '2015', filename: 'ia-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/ia-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/ia-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  fl: {
    projectionRotation: [84, -27.5],
    races: ['normal-votes', 'gov-2010', 'pres-2008', 'us-senate-2010'],
    dataSources: {
      tracts: 'fl-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'fl-congressional-districts-2010-simplified.json' },
        { name: '2015', filename: 'fl-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/fl-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/fl-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  nc: {
    projectionRotation: [79, -33],
    races: ['normal-votes', 'gov-2008', 'party-affiliation', 'pres-2008', 'us-senate-2008', 'us-senate-2010'],
    dataSources: {
      tracts: 'nc-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'nc-congressional-districts-2010-simplified.json' },
        { name: '2013', filename: 'nc-congressional-districts-2013-simplified.json' },
        { name: '2015', filename: 'nc-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/nc-congressional-districts-2010-totals.csv' },
        { name: '2013', filename: 'district-totals/nc-congressional-districts-2013-totals.csv' },
        { name: '2015', filename: 'district-totals/nc-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  nj: {
    projectionRotation: [74.5, -40],
    races: ['normal-votes'],
    dataSources: {
      tracts: 'nj-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'nj-congressional-districts-2010-simplified.json' },
        { name: '2015', filename: 'nj-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/nj-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/nj-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  ny: {
    projectionRotation: [76, -43],
    races: ['normal-votes'],
    dataSources: {
      tracts: 'ny-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'ny-congressional-districts-2010-simplified.json' },
        { name: '2015', filename: 'ny-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/ny-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/ny-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  tx: {
    projectionRotation: [98.5, -31],
    races: ['normal-votes', 'gov-2010', 'pres-2008'],
    dataSources: {
      tracts: 'tx-census-tracts-2010.json',
      districts: [
        { name: '2007 - 2013', filename: 'tx-congressional-districts-2010-simplified.json' },
        { name: 'C185 (proposed 2011)', filename: 'tx-congressional-districts-2011-simplified.json' },
        { name: '2013 - 2018', filename: 'tx-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/tx-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/tx-congressional-districts-2015-totals.csv' },
        { name: '--', filename: 'district-totals/tx-congressional-districts-2015-totals.csv' }
      ]
    }
  },

  wa: {
    projectionRotation: [120, -47],
    races: ['normal-votes'],
    dataSources: {
      tracts: 'wa-census-tracts-2010.json',
      districts: [
        { name: '2010', filename: 'wa-congressional-districts-2010-simplified.json' },
        { name: '2015', filename: 'wa-congressional-districts-2015-simplified.json' }
      ],
      totals: [
        { name: '2010', filename: 'district-totals/wa-congressional-districts-2010-totals.csv' },
        { name: '2015', filename: 'district-totals/wa-congressional-districts-2015-totals.csv' }
      ]
    }
  }
}
