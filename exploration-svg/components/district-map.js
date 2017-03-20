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
    const { clientWidth, clientHeight } = this.container
    const viewport = [clientWidth, clientHeight]
    const padding = 50
    const { projectionRotation } = stateConfig[this.props.settings.usState]
    const projection = d3.geoConicConformal()
      .rotate(projectionRotation)
      .fitExtent([[padding, padding], viewport.map(d => d - padding)], this.props.districts.data)
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
    const { settings, districts, tracts, totals, setSelectedDistrict } = this.props
    let maps = null
    if (this.state.projection) {
      const path = d3.geoPath(this.state.projection)
      maps = [
        <DistrictMap
          key={`${settings.usState}-districts`}
          path={path}
          settings={settings}
          districts={districts.data}
          totals={totals.data}
          setSelectedDistrict={setSelectedDistrict} />,
        <DemographicMap
          key={`${settings.usState}-demo`}
          settings={settings}
          tracts={tracts}
          projection={this.state.projection} />
      ]
    }

    return (
      <div className='district-map' ref={(el) => { this.container = el }} >
        {maps}
      </div>
    )
  }
}

class DistrictMap extends React.Component {
  render () {
    const { districts, totals, path, settings, setSelectedDistrict } = this.props
    const districtTotals = keyBy(totals, 'district-name')

    return (
      <svg>
        <g>
          {districts.features.map((feat, i) => {
            const districtName = feat.properties.NAMELSAD
            const isSelected = settings.selectedDistrict === districtName
            const strokeWidth = isSelected ? 3 : 1
            const strokeColor = isSelected ? '#333' : '#999'
            const values = getValuesForDimension(districtTotals[districtName], settings)
            const { winner, margin } = getWinnerMargin(values, settings)
            const alpha = settings.showDemo ? 0 : margin / 50
            const color = `rgba(${settings.colors[winner].join(', ')}, ${alpha})`

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
      </svg>
    )
  }
}

class DemographicMap extends React.Component {
  componentDidMount () {
    this.renderMap()
  }

  componentDidUpdate () {
    this.renderMap()
  }

  shouldComponentUpdate (nextProps) {
    return (
      this.props.settings.showDemo !== nextProps.settings.showDemo ||
      this.props.projection !== nextProps.projection
    )
  }

  renderMap () {
    this.container.innerHTML = ''
    if (!this.props.settings.showDemo) {
      return
    }
    const canvas = document.createElement('canvas')
    const { clientWidth, clientHeight } = this.container
    canvas.height = clientHeight
    canvas.width = clientWidth
    this.container.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    const path = d3.geoPath(this.props.projection).context(ctx)
    this.props.tracts.features.forEach((feat) => {
      const hispanicCount = parseInt(feat.properties['ethnicity:hispanic'], 10)
      const nonHispanicCount = parseInt(feat.properties['ethnicity:non-hispanic'], 10)
      const opacity = hispanicCount / (hispanicCount + nonHispanicCount)

      ctx.beginPath()
      ctx.fillStyle = `rgba(20, 200, 20, ${opacity})`
      ctx.strokeStyle = `rgb(80, 80, 80)`
      ctx.lineWidth = 0.1
      path(feat)
      ctx.stroke()
      ctx.fill()
    })
  }

  render () {
    return (
      <div className='demo-map' ref={(el) => { this.container = el }} />
    )
  }
}
