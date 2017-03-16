let customTransformation = () => {}

// NC
// const GEOJSON_FILE = '../nc_final.json'
// const PRECINCT_NAME_KEY = 'NAME10'
// const properties = {
//   voterPartyAffiliation: {
//     democrat: 'REG10G_D',
//     republican: 'REG10G_R',
//     libertarian: 'REG10G_L',
//     unaffiliated: 'REG10G_U'
//   },
//   genPopEthnicity: {
//     hispanic: 'PL10AA_HIS',
//     nonHispanic: 'PL10AA_NON'
//   },
//   genPopPrimaryRace: {
//     white: 'PL10AA_SR_',
//     black: 'PL10AA_SR0',
//     nativeAmerican: 'PL10AA_SR1',
//     asianPacificIslander: 'PL10AA_SR2',
//     other: 'PL10AA_SR3',
//     multirace: 'PL10AA_MR'
//   },
//   voterGender: {
//     male: 'REG10G_M',
//     female: 'REG10G_F',
//     undesignated: 'REG10G_UG'
//   },
//   voterAge: {
//     '18-25': 'REG10G_182',
//     '26-40': 'REG10G_264',
//     '41-65': 'REG10G_416',
//     '66+': 'REG10G_66U',
//     'undesignated': 'REG10G_UAG'
//   },
//   electionPresident2008: {
//     'democrat': 'EL08G_PR_D',
//     'republican': 'EL08G_PR_R',
//     'libertarian': 'EL08G_PR_L'
//   },
//   electionUSSenate2008: {
//     'democrat': 'EL08G_USS_',
//     'republican': 'EL08G_USS0',
//     'libertarian': 'EL08G_USS1'
//   },
//   electionUSSenate2010: {
//     'democrat': 'EL10G_USS_',
//     'republican': 'EL10G_USS0',
//     'libertarian': 'EL10G_USS1'
//   },
//   electionGovernor2008: {
//     'democrat': 'EL08G_GV_D',
//     'republican': 'EL08G_GV_R',
//     'libertarian': 'EL08G_GV_L'
//   }
// }

// TX
// const proj4 = require('proj4')
// const GEOJSON_FILE = '../tx_final.json'
// const PRECINCT_NAME_KEY = 'VTD'
// const properties = {
//   normalVotes: {
//     democrat: 'NV_D',
//     republican: 'NV_R'
//   },
//   electionPresident2008: {
//     democrat: 'Pres_D_08',
//     republican: 'Pres_R_08'
//   },
//   electionGovernor2010: {
//     democrat: 'Gov_D_10',
//     republican: 'Gov_R_10'
//   }
// }
// customTransformation = (feature) => {
//   const projection = '+proj=lcc +x_0=1000000 +y_0=1000000 +lon_0=-100 +lat_1=34.91666666666666 +lat_2=27.41666666666667 +lat_0=31.16666666666667 +datum=NAD83'
//   const p = proj4(projection)
//   const coords = feature.geometry.coordinates.map(points => {
//     // console.log(points)
//     return points.map(pt => p.inverse(pt))
//   })
//   feature.geometry.coordinates = coords
// }

// // AZ
// const GEOJSON_FILE = '../az_final.json'
// const PRECINCT_NAME_KEY = 'PRECNAME'
// const properties = {
//   normalVotes: {
//     democrat: 'NDV',
//     republican: 'NRV'
//   },
//   electionPresident2008: {
//     democrat: 'PRS08_DEM',
//     republican: 'PRS08_REP',
//     other: 'PRS08_OTH'
//   },
//   electionGovernor2010: {
//     democrat: 'GOV10_DEM',
//     republican: 'GOV10_REP',
//     other: 'GOV10_OTH'
//   },
//   electionUSSenate2010: {
//     democrat: 'USSEN10_DE',
//     republican: 'USSEN10_RE',
//     other: 'USSEN10_OT'
//   }
// }

// AL
// const GEOJSON_FILE = '../al_final.json'
// const PRECINCT_NAME_KEY = 'NAME10'
// const properties = {
//   normalVotes: {
//     democrat: 'NDV',
//     republican: 'NRV'
//   },
//   electionPresident2008: {
//     democrat: 'USP_D_08',
//     republican: 'USP_R_08'
//   },
//   electionUSSenate2008: {
//     democrat: 'USS_D_08',
//     republican: 'USS_R_08'
//   }
// }

// IA
// const GEOJSON_FILE = '../ia_final.json'
// const PRECINCT_NAME_KEY = 'NAME10'
// const properties = {
//   normalVotes: {
//     democrat: 'NDV',
//     republican: 'NRV'
//   },
//   electionPresident2008: {
//     democrat: 'PRES_D_08',
//     republican: 'PRES_R_08'
//   },
//   electionUSSenate2008: {
//     democrat: 'USS_D_08',
//     republican: 'USS_R_08'
//   },
//   electionUSHouse2008: {
//     democrat: 'USH_D_08',
//     republican: 'USH_R_08'
//   }
// }

// FL - 2008 presidential votes
// democrat: 'PRES_DEM_0'
// republican: 'PRES_REP_0'

// FL
const GEOJSON_FILE = '../fl_final.json'
const PRECINCT_NAME_KEY = 'PREC'
const properties = {
  normalVotes: {
    democrat: 'NDV',
    republican: 'NRV'
  },
  electionGovernor2010: {
    democrat: 'GOV_D_SINK',
    republican: 'GOV_R_SCOT'
  },
  electionPresident2008: {
    democrat: 'PRES_DEM_0',
    republican: 'PRES_REP_0'
  },
  electionUSSenate2010: {
    democrat: 'SEN_D_MEEK',
    republican: 'SEN_R_RUBI',
    other: 'SEN_NPA_CR'
  }
}

// WI - 2008 presidential votes
// democrat: 'PRESDEM08'
// republican: 'PRESREP08'
// libertarian: 'PRESLBR08'

const geojson = require(GEOJSON_FILE)
const features = geojson.features

const precincts = features.map(feat => {
  const props = {}
  for (let propGroupName in properties) {
    props[propGroupName] = props[propGroupName] || {}
    Object.keys(properties[propGroupName]).forEach(newPropName => {
      const oldPropName = properties[propGroupName][newPropName]
      props[propGroupName][newPropName] = feat.properties[oldPropName]
    })
  }
  props.precinctName = feat.properties[PRECINCT_NAME_KEY]
  feat.properties = props

  customTransformation(feat)

  return feat
})

process.stdout.write(JSON.stringify(precincts))
