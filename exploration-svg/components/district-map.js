import React from 'react'
import * as d3 from 'd3'
import keyBy from 'lodash/keyBy'
import debounce from 'lodash/debounce'
import { getValuesForDimension, getWinnerMargin } from '../helpers'
import stateConfig from '../state-config'

export default class Map extends React.Component {
  constructor () {
    super()
    this.onResize = this.onResize.bind(this)
    this.onZoom = this.onZoom.bind(this)
    this.state = {
      projection: null,
      transform: { x: 0, y: 0, k: 1 }
    }
  }

  onZoom (e) {
    const selection = d3.select(this.svg)
    this.setState({
      transform: d3.event.transform
    })
    console.log('zoomed!', selection)
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

    const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', this.onZoom)
    d3.select(this.container).call(zoom)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
    d3.select(this.container).on('.zoom', null)
  }

  render () {
    const { settings, districts, tracts, totals, setSelectedDistrict } = this.props
    let maps = null
    if (this.state.projection) {
      const path = d3.geoPath(this.state.projection)
      maps = [
        <DemographicMap
          key={`${settings.usState}-demo`}
          transform={this.state.transform}
          settings={settings}
          tracts={tracts}
          projection={this.state.projection} />,
        <DistrictMap
          key={`${settings.usState}-districts`}
          transform={this.state.transform}
          path={path}
          settings={settings}
          districts={districts.data}
          totals={totals.data}
          setSelectedDistrict={setSelectedDistrict} />
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
    const { x, y, k } = this.props.transform

    return (
      <svg ref={(el) => { this.svg = el }}>
        <g transform={`scale(${k}, ${k}) translate(${x / k}, ${y / k})`}>
          {districts.features.map((feat, i) => {
            const districtName = feat.properties.NAMELSAD
            const isSelected = settings.selectedDistrict === districtName
            const strokeWidth = (isSelected ? 3 : 1.5) / k
            const strokeColor = isSelected ? '#555' : '#888'
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
  constructor () {
    super()
    this.renderMap = debounce(this.renderMap.bind(this), 10)
  }

  componentDidMount () {
    this.updateMap()
  }

  componentDidUpdate (prevProps) {
    const isDemoChanged = this.props.settings.showDemo !== prevProps.settings.showDemo
    const isProjectionChanged = this.props.projection !== prevProps.projection
    const isTransformChanged = this.props.transform !== prevProps.transform
    if (isDemoChanged || isProjectionChanged || isTransformChanged) {
      this.updateMap()
    } else if (isTransformChanged) {
      // const canvas = this.container.querySelector('canvas')
      // const { x, y, k } = this.props.transform
      // // const transform = d3.zoomTransform(canvas)
      // // console.log(transform)
      // canvas.style.transform = `scale(${k}, ${k}) translate(${x}px, ${y}px)`
    }
  }

  updateMap () {
    this.container.innerHTML = ''
    this.renderMap()
  }

  renderMap () {
    const canvas = document.createElement('canvas')
    const { clientWidth, clientHeight } = this.container
    canvas.height = clientHeight
    canvas.width = clientWidth
    this.container.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    const { x, y, k } = this.props.transform
    ctx.translate(x, y)
    ctx.scale(k, k)
    const path = d3.geoPath(this.props.projection).context(ctx)

    // console.log(
    //   'census area extent, mean, median:',
    //   d3.extent(this.props.tracts.features, (feat) => feat.properties.CENSUSAREA),
    //   d3.mean(this.props.tracts.features, (feat) => feat.properties.CENSUSAREA),
    //   d3.median(this.props.tracts.features, (feat) => feat.properties.CENSUSAREA),
    //   this.props.tracts.features[0].properties
    // )

    this.props.tracts.features.forEach((feat) => {
      // const hispanicCount = parseInt(feat.properties['ethnicity:hispanic'], 10)
      // const nonHispanicCount = parseInt(feat.properties['ethnicity:non-hispanic'], 10)
      const nonWhiteCount = countNonWhite(feat.properties)
      const area = feat.properties.CENSUSAREA
      const opacity = nonWhiteCount / (area * 1000) // (hispanicCount + nonHispanicCount)

      ctx.beginPath()
      ctx.fillStyle = `rgba(91, 186, 113, ${Math.pow(opacity, 0.35)})`
      ctx.strokeStyle = `rgb(80, 80, 80)`
      ctx.lineWidth = 0.1 / k
      path(feat)
      if (this.props.settings.showDemo) {
        ctx.fill()
      } else {
        ctx.stroke()
      }
    })
  }

  render () {
    return (
      <div className='demo-map' ref={(el) => { this.container = el }} />
    )
  }
}

function countNonWhite(properties) {
  return Object.keys(properties).filter(prop => prop.slice(0, 5) === 'race:').reduce((tot, prop) => {
    if (prop === 'race:white') return tot
    return parseInt(properties[prop], 10) + tot
  }, 0)
}
