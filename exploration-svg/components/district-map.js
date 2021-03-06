import React from 'react'
import * as d3 from 'd3'
import ToolTip from './tooltip'
import keyBy from 'lodash/keyBy'
import debounce from 'lodash/debounce'
import chroma from 'chroma-js'
import { getValuesForDimension, getWinnerMargin } from '../helpers'
import stateConfig from '../state-config'

export default class Map extends React.Component {
  constructor () {
    super()
    this.onResize = this.onResize.bind(this)
    this.onZoom = this.onZoom.bind(this)
    this.state = {
      projection: null,
      transform: { x: 0, y: 0, k: 1 },
      mouse: [0, 0]
    }
  }

  onZoom (e) {
    this.setState({
      transform: d3.event.transform
    })
  }

  onResize () {
    this.updateProjection()
  }

  mouseMove (e) {
    const mouse = [e.clientX, e.clientY]
    this.setState({ mouse })
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
    const selectedDistrict = districts.data.features.find((feat) =>
      settings.selectedDistrict === feat.properties.NAMELSAD
    )
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
      <div onMouseMove={this.mouseMove.bind(this)} className='district-map' ref={(el) => { this.container = el }} >
        {maps}
        {settings.selectedDistrict ? (
          <ToolTip demographic={settings.demographic} district={selectedDistrict} position={this.state.mouse} />
        ) : null}
      </div>
    )
  }
}

Map.propTypes = {
  settings: React.PropTypes.object,
  districts: React.PropTypes.object,
  tracts: React.PropTypes.object,
  totals: React.PropTypes.object,
  setSelectedDistrict: React.PropTypes.func
}

class DistrictMap extends React.Component {
  render () {
    const { districts, totals, path, settings, setSelectedDistrict } = this.props
    const districtTotals = keyBy(totals, 'district-name')
    const { x, y, k } = this.props.transform

    const colorMap = chroma.scale([
      settings.colors.democrat,
      settings.colors.republican
    ]).mode('lab')

    const orderedDistricts = districts.features.slice()
    const selectedDistrictIndex = orderedDistricts.findIndex((feat) =>
      settings.selectedDistrict === feat.properties.NAMELSAD
    )
    const selectedDistrict = orderedDistricts.splice(selectedDistrictIndex, 1)[0]
    orderedDistricts.push(selectedDistrict)

    return (
      <svg ref={(el) => { this.svg = el }}>
        <g transform={`scale(${k}, ${k}) translate(${x / k}, ${y / k})`}>
          {orderedDistricts.map((feat, i) => {
            const districtName = feat.properties.NAMELSAD
            const isSelected = settings.selectedDistrict === districtName
            const strokeWidth = (isSelected ? 2 : 1.5) / k
            const strokeColor = isSelected ? '#444' : settings.demographic === 'minorities' ? '#999' : '#fdfdfd'
            const values = getValuesForDimension(districtTotals[districtName], settings.race)
            const total = Object.keys(values).reduce((tot, dim) => parseInt(values[dim], 10) + tot, 0)
            const { winner, margin } = getWinnerMargin(values, settings)

            const nonWinnerCount = total - parseInt(values[winner], 10)
            const winnerDegree = Math.pow(nonWinnerCount / total, 1.1)
            const colorDegree = winner === 'democrat' ? winnerDegree : 1 - winnerDegree
            let color = colorMap(colorDegree).rgb()
             // pushing the opacities down into the 0.1 - 0.9 range
            color.push(settings.demographic ? 0 : margin / 50 * 0.8 + 0.1)
            color = `rgba(${color.join(',')})`

            // const alpha = settings.demographic ? 0 : margin / 50
            // const color = `rgba(${settings.colors[winner].join(', ')}, ${alpha})`

            function onMouseEnter () {
              setSelectedDistrict(districtName)
            }

            function onMouseLeave () {
              if (settings.selectedDistrict === districtName) {
                setSelectedDistrict(null)
              }
            }

            return (
              <path
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                strokeWidth={strokeWidth}
                key={districtName}
                d={path(feat)}
                fill={color}
                stroke={strokeColor} />
            )
          })}
        </g>
      </svg>
    )
  }
}

DistrictMap.propTypes = {
  transform: React.PropTypes.object,
  settings: React.PropTypes.object,
  districts: React.PropTypes.object,
  path: React.PropTypes.func,
  totals: React.PropTypes.array,
  setSelectedDistrict: React.PropTypes.func
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
    const isDemoChanged = this.props.settings.demographic !== prevProps.settings.demographic
    const isProjectionChanged = this.props.projection !== prevProps.projection
    const isTransformChanged = this.props.transform !== prevProps.transform
    if (isDemoChanged || isProjectionChanged || isTransformChanged) {
      this.updateMap()
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
    const getColor = getColorFns[this.props.settings.demographic] || (() => `rgba(255, 255, 255, 0)`)
    this.props.tracts.features.forEach((feat) => {
      ctx.beginPath()
      ctx.fillStyle = getColor(feat.properties)
      ctx.strokeStyle = `rgb(60, 60, 60)`
      ctx.lineWidth = 0.1 / k
      path(feat)
      if (this.props.settings.demographic) {
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

DemographicMap.propTypes = {
  transform: React.PropTypes.object,
  settings: React.PropTypes.object,
  tracts: React.PropTypes.object,
  projection: React.PropTypes.func
}

const getColorFns = {
  race: (properties) => {
    const whiteCount = parseInt(properties['race:white'], 10)
    const raceValues = getValuesForDimension(properties, 'race')
    const total = Object.keys(raceValues).reduce((tot, key) => tot + parseInt(raceValues[key], 10), 0)
    const nonWhiteCount = total - whiteCount
    const colorMap = chroma.scale([[108, 131, 181], [115, 174, 128]]).mode('lab')
    const color = total ? colorMap(nonWhiteCount / total).rgb() : [150, 150, 150]
    const area = properties.CENSUSAREA
    const opacity = Math.pow(total / (area * 800), 0.3)
    color.push(opacity)
    return `rgba(${color.join(',')})`
  },
  ethnicity: (properties) => {
    const hispanicCount = parseInt(properties['ethnicity:hispanic'], 10)
    const nonHispanicCount = parseInt(properties['ethnicity:non-hispanic'], 10)
    const total = hispanicCount + nonHispanicCount
    const colorMap = chroma.scale([[108, 131, 181], [115, 174, 128]]).mode('lab')
    const color = total ? colorMap(hispanicCount / total).rgb() : [150, 150, 150]
    const area = properties.CENSUSAREA
    const opacity = Math.pow(total / (area * 800), 0.3)
    color.push(opacity)
    return `rgba(${color.join(',')})`
  },
  minorities: (() => {
    const ethnicity1ColorMap = chroma.scale([[255, 255, 255], [239, 147, 205]]).mode('lab')
    const erBlendedColor = chroma.scale([[239, 147, 205], [98, 224, 160]]).mode('lab')(0.5).rgb()
    return (properties) => {
      const nonHispanicCount = parseInt(properties['ethnicity:non-hispanic'], 10)
      const hispanicCount = parseInt(properties['ethnicity:hispanic'], 10)
      const ethnicityTotal = nonHispanicCount + hispanicCount
      const blackCount = parseInt(properties['race:black'], 10)
      const raceValues = getValuesForDimension(properties, 'race')
      const raceTotal = Object.keys(raceValues).reduce((tot, key) => tot + parseInt(raceValues[key], 10), 0)

      const e1Color = ethnicityTotal ? ethnicity1ColorMap(hispanicCount / ethnicityTotal).rgb() : [240, 240, 240]
      const ethnicity2ColorMap = chroma.scale([[98, 224, 160], erBlendedColor]).mode('lab')
      const e2Color = ethnicityTotal ? ethnicity2ColorMap(hispanicCount / ethnicityTotal).rgb() : [240, 240, 240]
      const color = raceTotal ? chroma.scale([e1Color, e2Color]).mode('lab')(blackCount / raceTotal).rgb() : [240, 240, 240]
      return `rgb(${color.join(',')})`
    }
  })()
  // minorities: (properties) => {
  //   const nonHispanicCount = parseInt(properties['ethnicity:non-hispanic'], 10)
  //   const hispanicCount = parseInt(properties['ethnicity:hispanic'], 10)
  //   const ethnicityTotal = nonHispanicCount + hispanicCount
  //   const blackCount = parseInt(properties['race:black'], 10)
  //   const raceValues = getValuesForDimension(properties, 'race')
  //   const raceCount = Object.keys(raceValues).reduce((tot, key) => tot + parseInt(raceValues[key], 10), 0)
  //   const total = (ethnicityTotal + raceCount) / 2
  //   // just looking at black and hispanic minorities for this one
  //   const minoritiesCount = blackCount + hispanicCount
  //   // const colorMap = chroma.scale([[239, 147, 205], [98, 224, 160]]).mode('lab')
  //   const colorMap = chroma.scale([[108, 131, 181], [115, 174, 128]]).mode('lab')
  //   const color = total ? colorMap(minoritiesCount / total).rgb() : [150, 150, 150]
  //   const area = properties.CENSUSAREA
  //   const opacity = Math.pow(total / (area * 800), 0.3)
  //   color.push(opacity)
  //   return `rgba(${color.join(',')})`
  // }
}
