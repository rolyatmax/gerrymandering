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
      districts: null,
      totals: null,
      district: 0,
      race: races[0],
      selectedDistrict: null,
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
        districts: null,
        totals: null
      }, this.fetchData.bind(this))
      return
    }
    this.setState(state)
  }

  fetchData () {
    const { dataSources } = stateConfig[this.state.usState]
    const districtsRequests = createRequests(dataSources.districts, (res) => res.json())
    const totalsRequests = createRequests(dataSources.totals, (res) => res.text().then(text => d3.csvParse(text)))
    const requests = [...districtsRequests, ...totalsRequests]
    Promise.all(requests).then((responses) => {
      const districts = responses.splice(0, districtsRequests.length)
      const totals = responses.splice(0, totalsRequests.length)
      this.setState({ dataLoaded: true, districts, totals })
    })
  }

  render () {
    if (!this.state.dataLoaded) {
      return <div>Loading!</div>
    }

    const { races } = stateConfig[this.state.usState]
    const districtMap = {}
    this.state.districts.forEach((d, i) => { districtMap[d.name] = i })
    const controls = {
      usState: [Object.keys(stateConfig)],
      district: [districtMap],
      race: [races]
    }

    return (
      <div>
        <Map setSelectedDistrict={(name) => this.onChange({ selectedDistrict: name })} districts={this.state.districts} totals={this.state.totals} settings={this.state} />
        <DistrictMargins districts={this.state.districts} totals={this.state.totals} settings={this.state} />
        <Controls controls={controls} settings={this.state} onChange={this.onChange.bind(this)} />
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
