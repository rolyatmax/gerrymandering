/* global requestAnimationFrame cancelAnimationFrame */

import React from 'react'
import * as d3 from 'd3'
import colorInterp from 'color-interpolate'
import cubicInOut from 'eases/cubic-in-out'
import { lerp } from 'interpolation'
import './Map.css'

const viewCenter = [window.innerWidth / 2, window.innerHeight / 2] //  [900, 360]
const duration = 1000

export default class Map extends React.Component {
  constructor (props) {
    super(props)
    this.onResize = this.onResize.bind(this)
    this.state = {
      projection: null,
      transform: { x: 0, y: 0, k: 1 },
      canvasTransform: props.transform
    }
  }

  zoomTo ([lon, lat], zoomLevel) {
    const start = Date.now()

    const pt = this.state.projection([lon, lat])

    const x = viewCenter[0] - pt[0]
    const y = viewCenter[1] - pt[1]
    const k = zoomLevel / this.state.canvasTransform.k

    const renderFrame = () => {
      const elapsed = Math.min(1, (Date.now() - start) / duration)
      const t = cubicInOut(elapsed)
      const transform = {
        x: lerp(0, x, t),
        y: lerp(0, y, t),
        k: lerp(1, k, t)
      }
      this.setState(() => ({
        transform: transform
      }))
      if (elapsed < 1) {
        this.rafToken = requestAnimationFrame(renderFrame)
      } else {
        this.setState({
          canvasTransform: { x: x, y: y, k: k },
          transform: { x: 0, y: 0, k: 1 }
        })
      }
    }
    this.rafToken = requestAnimationFrame(renderFrame)
  }

  // onZoom (e) {
  //   const x = viewCenter[0] - e.clientX
  //   const y = viewCenter[1] - e.clientY
  //   const k = this.state.transform.k
  //   this.zoomTransition({ x, y, k })
  // }

  onDoubleClickMap (e) {
    const { top, left } = e.target.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    const latLon = this.state.projection.invert([x, y])
    const zoomLevel = 1
    this.zoomTo(latLon, zoomLevel)
  }

  onResize () {
    this.updateProjection()
  }

  updateProjection () {
    const { clientWidth, clientHeight } = this.container
    const viewport = [clientWidth, clientHeight]
    const { tracts } = this.props
    const rotation = d3.geoCentroid(tracts).map(val => val * -1)
    const projection = d3.geoConicConformal()
      .rotate(rotation)
      .fitExtent([[0, 0], viewport], tracts)
    this.setState({ projection })
  }

  componentDidMount () {
    this.updateProjection()
    window.addEventListener('resize', this.onResize)
    if (this.ctx) {
      this.renderMap()
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
    cancelAnimationFrame(this.rafToken)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.projection !== prevState.projection && this.ctx) {
      this.renderMap()
    }
  }

  renderMap () {
    const { clientWidth, clientHeight } = this.ctx.canvas.parentElement
    this.ctx.canvas.height = clientHeight
    this.ctx.canvas.width = clientWidth
    const { x, y, k } = this.state.canvasTransform
    // this.ctx.scale(k, k)
    this.ctx.translate(-x, -y)
    const path = d3.geoPath(this.state.projection).context(this.ctx)

    this.props.tracts.features.forEach((feat) => {
      this.ctx.beginPath()
      this.ctx.fillStyle = getColor(feat.properties, this.props.demographic)
      this.ctx.strokeStyle = `rgb(60, 60, 60)`
      this.ctx.lineWidth = 0.1 / k
      path(feat)
      if (this.props.demographic) {
        this.ctx.fill()
      } else {
        this.ctx.stroke()
      }
    })
  }

  render () {
    const { x, y, k } = this.state.transform
    const style = {
      transformOrigin: `${viewCenter[0]}px ${viewCenter[1]}px`,
      transform: `scale(${k}, ${k}) translate(${x}px, ${y}px)`
    }

    return (
      <div
        style={style}
        className='Map'
        ref={(el) => { this.container = el }} >
        {this.state.projection ? (
          <canvas
            onDoubleClick={this.onDoubleClickMap.bind(this)}
            ref={(el) => { this.ctx = el && el.getContext('2d') }} />
        ) : null}
      </div>
    )
  }
}

Map.propTypes = {
  demographic: React.PropTypes.string.isRequired,
  tracts: React.PropTypes.object.isRequired,
  transform: React.PropTypes.object.isRequired
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
