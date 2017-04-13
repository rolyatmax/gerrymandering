/* global fetch  */

import React from 'react'
import * as d3 from 'd3'
import Map from './district-map'
import DistrictMargins from './district-margins'
import Controls from './controls'
import stateConfig from '../state-config'

window.d3 = d3

export default class App extends React.Component {
  constructor (props) {
    super()
    const defaultState = 'tx'
    const { races } = stateConfig[defaultState]
    this.state = {
      usState: defaultState,
      dataLoaded: false,
      tracts: null,
      districts: null,
      totals: null,
      sort: 'name',
      'district-map': 0,
      race: races[0],
      selectedDistrict: null,
      demographic: 'race',
      colors: {
        democrat: [61, 94, 156],
        republican: [195, 35, 44],
        libertarian: [80, 220, 80],
        unaffiliated: [200, 20, 200],
        other: [200, 20, 200]
      }
    }
  }

  componentWillMount () {
    this.fetchData()
  }

  onChange (state) {
    if (state.usState && state.usState !== this.state.usState) {
      this.setState({
        ...state,
        race: stateConfig[state.usState].races[0],
        dataLoaded: false,
        tracts: null,
        districts: null,
        totals: null
      }, this.fetchData.bind(this))
      return
    }
    this.setState(state)
  }

  fetchData () {
    const { dataSources } = stateConfig[this.state.usState]
    const tractsRequest = fetch(`data/${dataSources.tracts}`).then((res) => res.json())
    const districtsRequests = createRequests(dataSources.districts, (res) => res.json())
    const totalsRequests = createRequests(dataSources.totals, (res) => res.text().then(text => d3.csvParse(text)))
    const requests = [tractsRequest, ...districtsRequests, ...totalsRequests]
    Promise.all(requests).then((responses) => {
      const tracts = responses.splice(0, 1)[0]
      const districts = responses.splice(0, districtsRequests.length)
      const totals = responses.splice(0, totalsRequests.length)
      this.setState({ dataLoaded: true, tracts, districts, totals })
    })
  }

  render () {
    if (!this.state.dataLoaded) {
      return <div>Loading!</div>
    }

    const districtMaps = {}
    this.state.districts.forEach((d, i) => { districtMaps[d.name] = i })

    const controls = [
      {
        label: 'State',
        settingsKey: 'usState',
        values: Object.keys(stateConfig).map(stateCode => [stateCode, stateCode.toUpperCase()])
      },
      {
        label: 'District Map',
        settingsKey: 'district-map',
        values: Object.keys(districtMaps).map(name => [districtMaps[name], name])
      },
      // {
      //   label: 'Races',
      //   settingsKey: 'race',
      //   values: races
      // },
      // {
      //   label: 'Sort',
      //   settingsKey: 'sort',
      //   values: [
      //     ['name', 'Name'],
      //     ['margin', 'Margin']
      //   ]
      // },
      {
        label: 'Overlay',
        settingsKey: 'demographic',
        values: [
          ['race', 'Race'],
          ['ethnicity', 'Ethnicity'],
          [null, 'Vote Margins']
        ]
      }
    ]

    const setSelectedDistrict = (name) => this.onChange({ selectedDistrict: name })
    const districtMap = this.state.districts[this.state['district-map']]
    const totals = this.state.totals[this.state['district-map']]
    return (
      <div className='interactive'>
        <Controls controls={controls} settings={this.state} onChange={this.onChange.bind(this)} />
        <Map setSelectedDistrict={setSelectedDistrict} tracts={this.state.tracts} districts={districtMap} totals={totals} settings={this.state} />
        <DistrictMargins setSelectedDistrict={setSelectedDistrict} districts={districtMap} totals={totals} settings={this.state} />
      </div>
    )
  }
}

function createRequests (resources, parse = (val) => val) {
  return resources
    .map((d, i) => fetch(`data/${d.filename}`)
      .then(parse)
      .then(data => ({
        data: data,
        name: resources[i].name
      }))
    )
}
