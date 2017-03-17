import React from 'react'
import * as d3 from 'd3'
import keyBy from 'lodash/keyBy'
import { getValuesForDimension, getWinnerMargin } from '../helpers'
import stateConfig from '../state-config'

export default class Map extends React.Component {
  constructor () {
    super()
    this.onResize = this.onResize.bind(this)
    this.state = {
      projection: null
    }
  }

  onResize () {
    this.updateProjection()
  }

  updateProjection () {
    const { width, height } = this.svgEl.parentElement.getBoundingClientRect(this.svgEl)
    const viewport = [width, height]
    const padding = 50
    const { projectionRotation } = stateConfig[this.props.settings.usState]
    const district = this.props.districts[this.props.settings['district-map']]
    const projection = d3.geoConicConformal()
      .rotate(projectionRotation)
      .fitExtent([[padding, padding], viewport.map(d => d - padding)], {
        type: 'FeatureCollection',
        features: district.data
      })
    this.setState({ projection })
  }

  componentDidMount () {
    this.updateProjection()
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  }

  render () {
    const { settings, districts, totals, setSelectedDistrict } = this.props
    let map = null
    if (this.state.projection) {
      const district = districts[settings['district-map']]
      const total = totals[settings['district-map']]
      const path = d3.geoPath(this.state.projection)
      map = (
        <DistrictMap
          path={path}
          settings={settings}
          districts={district.data}
          totals={total.data}
          setSelectedDistrict={setSelectedDistrict} />
      )
    }

    return (
      <div className='district-map'>
        <svg ref={(el) => { this.svgEl = el }}>
          {map}
        </svg>
      </div>
    )
  }
}

class DistrictMap extends React.Component {
  render () {
    const { districts, totals, path, settings, setSelectedDistrict } = this.props
    const districtTotals = keyBy(totals, 'district-name')

    return (
      <g ref={(el) => { this.mapSelection = d3.select(el) }}>
        {districts.map((feat, i) => {
          const districtName = feat.properties.NAMELSAD
          const strokeWidth = settings.selectedDistrict === districtName ? 3 : 1
          const strokeColor = settings.selectedDistrict === districtName ? '#333' : '#999'
          const values = getValuesForDimension(districtTotals[districtName], settings)
          const { winner, margin } = getWinnerMargin(values, settings)
          const color = `rgba(${settings.colors[winner].join(', ')}, ${margin / 50})`

          function onMouseEnter () {
            setSelectedDistrict(districtName)
          }

          function onMouseLeave () {
            if (settings.selectedDistrict === districtName) {
              setSelectedDistrict(null)
            }
          }

          return <path onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} strokeWidth={strokeWidth} key={districtName} d={path(feat)} fill={color} stroke={strokeColor} />
        })}
      </g>
    )
  }
}
