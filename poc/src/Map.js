import React from 'react'
import * as d3 from 'd3'
import throttle from 'lodash/throttle'
import colorInterp from 'color-interpolate'
import './Map.css'

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

  onZoom () {
    console.log(d3.event.sourceEvent)
    this.setState({
      transform: d3.event.transform
    })
  }

  onResize () {
    this.updateProjection()
  }

  updateProjection () {
    const { clientWidth, clientHeight } = this.container
    const viewport = [clientWidth, clientHeight]
    const { padding, tracts } = this.props
    const rotation = d3.geoCentroid(tracts).map(val => val * -1)
    const projection = d3.geoConicConformal()
      .rotate(rotation)
      .fitExtent([[padding[3], padding[0]], [viewport[0] - padding[1], viewport[1] - padding[2]]], tracts)
    this.setState({ projection })
  }

  componentDidMount () {
    this.updateProjection()
    window.addEventListener('resize', this.onResize)

    const zoom = d3.zoom().scaleExtent([1, 16]).on('zoom', this.onZoom)
    d3.select(this.container).call(zoom)
    d3.select(this.container).on('wheel.zoom', null)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
    d3.select(this.container).on('.zoom', null)
  }

  render () {
    return (
      <div className='Map' ref={(el) => { this.container = el }} >
        {this.state.projection ? (
          <DemographicMap
            transform={this.state.transform}
            demographic={this.props.demographic}
            tracts={this.props.tracts}
            projection={this.state.projection} />
          ) : null}
      </div>
    )
  }
}

Map.propTypes = {
  demographic: React.PropTypes.string.isRequired,
  tracts: React.PropTypes.object.isRequired,
  padding: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
}

class DemographicMap extends React.Component {
  constructor () {
    super()
    this.renderMap = throttle(this.renderMap.bind(this), 5)
  }

  componentDidMount () {
    this.updateMap()
  }

  componentDidUpdate (prevProps) {
    const isDemoChanged = this.props.demographic !== prevProps.demographic
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

    this.props.tracts.features.forEach((feat) => {
      ctx.beginPath()
      ctx.fillStyle = getColor(feat.properties, this.props.demographic)
      ctx.strokeStyle = `rgb(60, 60, 60)`
      ctx.lineWidth = 0.1 / k
      path(feat)
      if (this.props.demographic) {
        ctx.fill()
      } else {
        ctx.stroke()
      }
    })
  }

  render () {
    return (
      <div className='demographic-map' ref={(el) => { this.container = el }} />
    )
  }
}

DemographicMap.propTypes = {
  transform: React.PropTypes.object.isRequired,
  demographic: React.PropTypes.string.isRequired,
  tracts: React.PropTypes.object.isRequired,
  projection: React.PropTypes.func.isRequired
}

function getColor (properties, demographic) {
  const values = getValuesForDimension(properties, demographic)
  const total = Object.keys(values).reduce((tot, dim) => parseInt(values[dim], 10) + tot, 0)
  const whiteCount = parseInt(properties['race:white'], 10)
  const nonWhiteCount = total - whiteCount
  const hispanicCount = parseInt(properties['ethnicity:hispanic'], 10)

  const colorMap = colorInterp([[108, 131, 181], [115, 174, 128]])

  let color = [150, 150, 150]
  if (total) {
    const leftHandSideDegree = demographic === 'race' ? nonWhiteCount / total : demographic === 'ethnicity' ? hispanicCount / total : 0
    color = colorMap(leftHandSideDegree)
    color = color.replace('rgb(', '').replace(')', '').split(',')
  }

  const area = properties.CENSUSAREA
  const opacity = Math.pow(total / (area * 800), 0.3)
  color.push(opacity)
  return `rgba(${color.join(',')})`
}

export function getValuesForDimension (counts, dimension) {
  const values = {}
  for (let dim in counts) {
    const [dimName, val] = dim.split(':')
    if (dimName === dimension) {
      values[val] = counts[dim]
    }
  }
  return values
}
