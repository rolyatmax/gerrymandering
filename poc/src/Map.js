/* global requestAnimationFrame cancelAnimationFrame */

import React from 'react'
import * as d3 from 'd3'
import colorInterp from 'color-interpolate'
import { lerp } from 'interpolation'
import './Map.css'

export default class Map extends React.Component {
  constructor (props) {
    super(props)
    this.onResize = this.onResize.bind(this)
    this.state = {
      projection: null,
      transform: { x: 0, y: 0, k: 1 },
      viewCenter: [0, 0],
      initialScale: 150,
      canvasSize: [0, 0]
    }
  }

  componentDidMount () {
    this.setProjection()
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
    cancelAnimationFrame(this.rafToken)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.projection !== prevState.projection && this.ctx) {
      this.renderMap()
    }
    if (prevProps.focus !== this.props.focus || prevProps.zoomLevel !== this.props.zoomLevel) {
      this.zoomTo(this.props.focus, this.props.zoomLevel * this.state.initialScale)
    }
  }

  onResize () {
    this.setProjection()
  }

  setProjection () {
    const { clientWidth, clientHeight } = this.container
    const { tracts, focus, zoomLevel } = this.props
    const viewport = [clientWidth * zoomLevel, clientHeight * zoomLevel]
    console.log(zoomLevel, viewport, clientWidth, clientHeight)
    const viewCenter = [clientWidth * 0.75, clientHeight * 0.5]
    const centroid = d3.geoCentroid(tracts)
    const rotation = centroid.map(val => -val)
    const initialProjection = d3.geoConicConformal()
      .rotate(rotation)
      .fitExtent([[0, 0], viewport], tracts)
    const initialScale = initialProjection.scale()
    const { projection, transform, canvasSize } = this.getCanvasProperties(focus, zoomLevel, initialScale, initialProjection, viewCenter)
    this.setState({ projection, viewCenter, initialScale, transform, canvasSize })
  }

  getCanvasProperties ([lon, lat], zoomLevel, initialScale, projection, viewCenter) {
    const scale = zoomLevel * initialScale
    const { clientWidth, clientHeight } = this.container
    const canvasSize = [clientWidth * zoomLevel, clientHeight * zoomLevel]
    const translate = [canvasSize[0] / 2, canvasSize[1] / 2]
    projection = cloneFn(projection.scale(scale).translate(translate))
    const destinationPixels = projection([lon, lat])
    console.log('destinationPixels', destinationPixels)
    const x = destinationPixels[0] - viewCenter[0]
    const y = destinationPixels[1] - viewCenter[1]
    return {
      projection: projection,
      transform: { x: -x, y: -y, k: 1 },
      canvasSize: canvasSize
    }
  }

  zoomTo ([lon, lat], scale) {
    // FIXME: NEED TO ALSO CANCEL ANY OTHER ANIMATION

    const start = Date.now()

    const pt = this.state.projection([lon, lat])

    const x = this.state.viewCenter[0] - pt[0]
    const y = this.state.viewCenter[1] - pt[1]
    const k = scale / this.state.projection.scale()

    const startX = this.state.transform.x
    const startY = this.state.transform.y

    const renderFrame = () => {
      const elapsed = Math.min(1, (Date.now() - start) / this.props.transitionDuration)
      const t = this.props.transitionEasing(elapsed)
      this.setState(() => ({
        transform: {
          x: lerp(startX, x, t),
          y: lerp(startY, y, t),
          k: lerp(1, k, t)
        }
      }))
      if (elapsed < 1) {
        this.rafToken = requestAnimationFrame(renderFrame)
      } else {
        this.setState((prevState) => {
          const { projection, transform, canvasSize } = this.getCanvasProperties([lon, lat], scale / this.state.initialScale, this.state.initialScale, prevState.projection, prevState.viewCenter)
          return {
            projection: projection,
            transform: transform,
            canvasSize: canvasSize
          }
        })
      }
    }
    this.rafToken = requestAnimationFrame(renderFrame)
  }

  onDoubleClickMap (e) {
    const latLon = this.getCoordinatesFromClickEvent(e)
    const scale = this.state.projection.scale() * 2
    this.zoomTo(latLon, scale)
  }

  // onMouseUp (e) {
  //   this.dragStartTranslation = null
  //   this.dragStartMouse = null
  // }
  //
  // onMouseDown (e) {
  //   this.dragStartTranslation = this.state.projection.translate()
  //   this.dragStartMouse = [e.clientX, e.clientY]
  // }
  //
  // onMouseMove (e) {
  //   if (!this.dragStartMouse) {
  //     return
  //   }
  //
  //   const x = e.clientX - this.dragStartMouse[0] + this.dragStartTranslation[0]
  //   const y = e.clientY - this.dragStartMouse[1] + this.dragStartTranslation[1]
  //   console.log(this.dragStartTranslation)
  // }

  getCoordinatesFromClickEvent (e) {
    const { top, left } = e.target.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    return this.state.projection.invert([x, y]) // also account for translation here
  }

  // for debugging
  onClick (e) {
    const { top, left } = e.target.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    console.log(this.getCoordinatesFromClickEvent(e), [x, y])
  }

  renderMap () {
    const [width, height] = this.state.canvasSize
    this.ctx.canvas.height = height
    this.ctx.canvas.width = width
    const path = d3.geoPath(this.state.projection).context(this.ctx)

    this.props.tracts.features.forEach((feat) => {
      this.ctx.beginPath()
      this.ctx.fillStyle = getColor(feat.properties, this.props.demographic)
      this.ctx.strokeStyle = `rgb(60, 60, 60)`
      this.ctx.lineWidth = 0.1
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
      transformOrigin: `${this.state.viewCenter[0]}px ${this.state.viewCenter[1]}px`,
      transform: `scale(${k}, ${k}) translate(${x}px, ${y}px)`, // css transforms are applied right-to-left
      // transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden'
    }

    return (
      <div
        style={style}
        className='Map'
        ref={(el) => { this.container = el }} >
        {this.state.projection ? (
          <canvas
            onClick={this.onClick.bind(this)}
            // onMouseUp={this.onMouseUp.bind(this)}
            // onMouseMove={this.onMouseMove.bind(this)}
            // onMouseDown={this.onMouseDown.bind(this)}
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
  focus: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  zoomLevel: React.PropTypes.number.isRequired,
  transitionDuration: React.PropTypes.number.isRequired,
  transitionEasing: React.PropTypes.func.isRequired
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

function getValuesForDimension (counts, dimension) {
  const values = {}
  for (let dim in counts) {
    const [dimName, val] = dim.split(':')
    if (dimName === dimension) {
      values[val] = counts[dim]
    }
  }
  return values
}

function cloneFn (fn, context = null) {
  const clonedFn = fn.bind(context)
  for (let prop in fn) {
    if (fn.hasOwnProperty(prop)) {
      clonedFn[prop] = fn[prop]
    }
  }
  return clonedFn
}
