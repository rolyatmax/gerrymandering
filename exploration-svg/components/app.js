import React from 'react'
import Map from './district-map'
import DistrictMargins from './district-margins'
import Controls from './controls'

export default class App extends React.Component {
  constructor (props) {
    super()
    this.state = {
      district: 0,
      dimension: 'us-senate-2008',
      showPrecincts: false,
      selectedDistrict: null,
      colors: {
        democrat: [61, 94, 156],
        republican: [195, 35, 44],
        libertarian: [80, 220, 80],
        unaffiliated: [200, 20, 200]
      }
    }
  }

  render () {
    const districtMap = {}
    this.props.districts.forEach((d, i) => { districtMap[d.name] = i })
    // const dimensions = [
    //   'age', 'ethnicity', 'gender', 'gov-2008', 'party-affiliation', 'pres-2008', 'race',
    //   'us-senate-2008', 'us-senate-2010'
    // ]
    const dimensions = [
      'gov-2008', 'party-affiliation', 'pres-2008', 'us-senate-2008', 'us-senate-2010'
    ]
    const controls = {
      district: [districtMap],
      dimension: [dimensions],
      // showPrecincts: []
    }

    return (
      <div>
        <h2>North Carolina &amp; Its Voting Districts</h2>
        <Map setSelectedDistrict={(name) => this.setState({ selectedDistrict: name })} precincts={this.props.precincts} districts={this.props.districts} totals={this.props.totals} settings={this.state} />
        <DistrictMargins districts={this.props.districts} totals={this.props.totals} settings={this.state} />
        <Controls controls={controls} settings={this.state} onChange={(settings) => this.setState(settings)} />
      </div>
    )
  }
}
