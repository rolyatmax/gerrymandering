const geojson = require('../nc_final.json')

const features = geojson.features

// NC
const properties = {
  voterPartyAffiliation: {
    democrat: 'REG10G_D',
    republican: 'REG10G_R',
    libertarian: 'REG10G_L',
    unaffiliated: 'REG10G_U'
  },
  genPopEthnicity: {
    hispanic: 'PL10AA_HIS',
    nonHispanic: 'PL10AA_NON'
  },
  genPopPrimaryRace: {
    white: 'PL10AA_SR_',
    black: 'PL10AA_SR0',
    nativeAmerican: 'PL10AA_SR1',
    asianPacificIslander: 'PL10AA_SR2',
    other: 'PL10AA_SR3',
    multirace: 'PL10AA_MR'
  },
  voterGender: {
    male: 'REG10G_M',
    female: 'REG10G_F',
    undesignated: 'REG10G_UG'
  },
  voterAge: {
    '18-25': 'REG10G_182',
    '26-40': 'REG10G_264',
    '41-65': 'REG10G_416',
    '66+': 'REG10G_66U',
    'undesignated': 'REG10G_UAG'
  },
  electionPresident2008: {
    'democrat': 'EL08G_PR_D',
    'republican': 'EL08G_PR_R',
    'libertarian': 'EL08G_PR_L'
  },
  electionUSSenate2008: {
    'democrat': 'EL08G_USS_',
    'republican': 'EL08G_USS0',
    'libertarian': 'EL08G_USS1'
  },
  electionUSSenate2010: {
    'democrat': 'EL10G_USS_',
    'republican': 'EL10G_USS0',
    'libertarian': 'EL10G_USS1'
  },
  electionGovernor2008: {
    'democrat': 'EL08G_GV_D',
    'republican': 'EL08G_GV_R',
    'libertarian': 'EL08G_GV_L'
  }
}

// AL - 2008 presidential votes
// democrat: 'USP_D_08'
// republican: 'USP_R_08'

// FL - 2008 presidential votes
// democrat: 'PRES_DEM_0'
// republican: 'PRES_REP_0'

// WI - 2008 presidential votes
// democrat: 'PRESDEM08'
// republican: 'PRESREP08'
// libertarian: 'PRESLBR08'

const precincts = features.map(feat => {
  const props = {}
  for (let propGroupName in properties) {
    props[propGroupName] = props[propGroupName] || {}
    Object.keys(properties[propGroupName]).forEach(newPropName => {
      const oldPropName = properties[propGroupName][newPropName]
      props[propGroupName][newPropName] = feat.properties[oldPropName]
    })
  }
  props.precinctName = feat.properties['NAME10']
  feat.properties = props
  return feat
})

process.stdout.write(JSON.stringify(precincts))
