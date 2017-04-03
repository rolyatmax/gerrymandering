/* global requestAnimationFrame cancelAnimationFrame */

// make this just a container that handles translations etc

import React from 'react'
import * as d3 from 'd3'
import { lerp } from 'interpolation'
import './Map.css'

export default class ZoomMap extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onResize = this.onResize.bind(this)
    this.state = {
      projection: null,
      transform: { x: 0, y: 0, k: 1 },
      viewCenter: [0, 0],
      initialScale: 150,
      dimensions: [0, 0]
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
    if (this.state.projection && this.state.projection !== prevState.projection) {
      this.props.draw(this.state.projection, this.state.dimensions)
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
    const { geoJSON, focus, zoomLevel } = this.props
    const viewCenter = [clientWidth * 0.75, clientHeight * 0.5]
    const centroid = d3.geoCentroid(geoJSON)
    const rotation = centroid.map(val => -val)
    const initialProjection = d3.geoConicConformal()
      .rotate(rotation)
      .fitExtent([[50, 50], [clientWidth - 50, clientHeight - 50]], geoJSON)
    const initialScale = initialProjection.scale()
    const { projection, transform, dimensions } = this.getCanvasProperties(focus, zoomLevel, initialScale, initialProjection, viewCenter)
    this.setState({ projection, viewCenter, initialScale, transform, dimensions })
  }

  getCanvasProperties ([lon, lat], zoomLevel, initialScale, projection, viewCenter) {
    const scale = zoomLevel * initialScale
    const { clientWidth, clientHeight } = this.container
    const dimensions = [clientWidth * zoomLevel, clientHeight * zoomLevel]
    const translate = [dimensions[0] / 2, dimensions[1] / 2]
    projection = cloneFn(projection.scale(scale).translate(translate))
    const destinationPixels = projection([lon, lat])
    const x = destinationPixels[0] - viewCenter[0]
    const y = destinationPixels[1] - viewCenter[1]
    return {
      projection: projection,
      transform: { x: -x, y: -y, k: 1 },
      dimensions: dimensions
    }
  }

  zoomTo ([lon, lat], scale) {
    // TODO: Use spring forces to animate?
    cancelAnimationFrame(this.rafToken)

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
          const { projection, transform, dimensions } = this.getCanvasProperties([lon, lat], scale / prevState.initialScale, prevState.initialScale, prevState.projection, prevState.viewCenter)
          return {
            projection: projection,
            transform: transform,
            dimensions: dimensions
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

  onMouseUp (e) {
    this.dragStartTranslation = null
    this.dragStartMouse = null
  }

  onMouseDown (e) {
    this.dragStartTranslation = [this.state.transform.x, this.state.transform.y]
    this.dragStartMouse = [e.clientX, e.clientY]
  }

  onMouseMove (e) {
    if (!this.dragStartMouse) {
      return
    }

    const x = e.clientX - this.dragStartMouse[0] + this.dragStartTranslation[0]
    const y = e.clientY - this.dragStartMouse[1] + this.dragStartTranslation[1]
    const k = this.state.transform.k

    this.setState({
      transform: { x, y, k }
    })
    console.log(this.dragStartTranslation, x, y)
  }

  // for debugging
  onClick (e) {
    const { top, left } = e.target.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    console.log(this.getCoordinatesFromClickEvent(e), [x, y])
  }

  getCoordinatesFromClickEvent (e) {
    const { top, left } = e.target.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    return this.state.projection.invert([x, y]) // also account for translation here
  }

  render () {
    const { x, y, k } = this.state.transform
    const style = {
      transformOrigin: `${this.state.viewCenter[0]}px ${this.state.viewCenter[1]}px`,
      transform: `scale(${k}, ${k}) translate(${x}px, ${y}px)`, // css transforms are applied right-to-left
      // transformStyle: 'preserve-3d', // disabling for now since it makes everything look less sharp
      backfaceVisibility: 'hidden'
    }

    return (
      <div
        style={style}
        className='Map'
        onClick={this.onClick.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
        onDoubleClick={this.onDoubleClickMap.bind(this)}
        ref={(el) => { this.container = el }} >
        {this.state.projection ? (
          <PureComponent
            projection={this.state.projection}
            dimensions={this.state.dimensions}>{this.props.children}</PureComponent>
        ) : null}
      </div>
    )
  }
}

Map.propTypes = {
  draw: React.PropTypes.func.isRequired,
  geoJSON: React.PropTypes.arrayOf(React.PropTypes.number).isRequired, // really only need these to get the center and extent for fitting
  focus: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  zoomLevel: React.PropTypes.number.isRequired,
  transitionDuration: React.PropTypes.number.isRequired,
  transitionEasing: React.PropTypes.func.isRequired
}

class PureComponent extends React.PureComponent {
  shouldComponentUpdate (props) {
    return (this.props.projection !== props.projection || this.props.dimensions !== props.dimensions)
  }

  render () {
    return <this.props.children
      projection={this.props.projection}
      dimensions={this.props.dimensions} />
  }
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
