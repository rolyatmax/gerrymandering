import React from 'react'
import * as d3 from 'd3'
import keyBy from 'lodash/keyBy'
import { getValuesForDimension, getWinnerMargin } from '../helpers'
import stateConfig from '../state-config'

export default class Map extends React.Component {
  render () {
    const { settings, districts, totals, setSelectedDistrict } = this.props
    const viewport = [window.innerWidth, window.innerHeight]
    const [width, height] = viewport
    const padding = 100
    const district = districts[settings.district]
    const total = totals[settings.district]
    const { projectionRotation } = stateConfig[settings.usState]
    const projection = d3.geoConicConformal()
      .rotate(projectionRotation)
      .fitExtent([[padding, padding], viewport.map(d => d - padding)], {
        type: 'FeatureCollection',
        features: district.data
      })
    const path = d3.geoPath(projection)
    const baseMapProps = { path, settings }

    return (
      <div>
        <svg
          width={width}
          height={height}
          style={{ position: 'absolute', transition: 'opacity 200ms linear' }}>
          <DistrictMap {...baseMapProps} districts={district.data} totals={total.data} setSelectedDistrict={setSelectedDistrict} />
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
