/* global requestAnimationFrame cancelAnimationFrame */

import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import { createSpring } from 'spring-animator'
import './ZoomMap.css'

export default class ZoomMap extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onResize = this.onResize.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.state = {
      projection: null,
      transform: { x: 0, y: 0, k: 1 },
      viewCenter: [0, 0],
      initialScale: 150,
      dimensions: [0, 0]
    }
  }

  componentDidMount () {
    this.setProjectionAndCreateSprings()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('mousemove', this.onMouseMove)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('mousemove', this.onMouseMove)
    cancelAnimationFrame(this.rafToken)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.focus !== this.props.focus || prevProps.zoomLevel !== this.props.zoomLevel) {
      this.zoomTo(this.props.focus, this.getScale(this.props.zoomLevel))
    }
  }

  getScale (zoomLevel) {
    zoomLevel = Math.max(this.props.minZoom, Math.min(this.props.maxZoom, zoomLevel))
    return zoomLevel * this.state.initialScale
  }

  onResize () {
    this.setProjectionAndCreateSprings()
  }

  setProjectionAndCreateSprings () {
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

    const [stiffness, dampening] = this.props.transitionSpringForces
    this.xAnimator = createSpring(stiffness, dampening, transform.x)
    this.yAnimator = createSpring(stiffness, dampening, transform.y)
    this.kAnimator = createSpring(stiffness, dampening, 1)

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

  isAnimating () {
    return !(
      this.xAnimator.isAtDestination(0.5) &&
      this.yAnimator.isAtDestination(0.5) &&
      this.kAnimator.isAtDestination(0.01)
    )
  }

  zoomTo ([lon, lat], scale) {
    this.container.style['pointer-events'] = 'none'

    cancelAnimationFrame(this.rafToken)

    const pt = this.state.projection([lon, lat])
    const x = this.state.viewCenter[0] - pt[0]
    const y = this.state.viewCenter[1] - pt[1]
    const k = scale / this.state.projection.scale()

    // TODO: i think that if this thing isn't animating, we'll need to set new start values
    // because the canvas will have rerendered and oriented - i thiiiiiiink
    if (!this.isAnimating()) {
      this.xAnimator.updateValue(this.state.transform.x, false)
      this.yAnimator.updateValue(this.state.transform.y, false)
      this.kAnimator.updateValue(this.state.transform.k, false)
    }

    this.xAnimator.updateValue(x)
    this.yAnimator.updateValue(y)
    this.kAnimator.updateValue(k)

    let framesCount = 0

    this.rafToken = requestAnimationFrame(renderFrame.bind(this))

    function renderFrame () {
      framesCount += 1

      if (this.isAnimating()) {
        this.rafToken = requestAnimationFrame(renderFrame.bind(this))
      } else {
        this.setState((prevState) => {
          this.container.style['pointer-events'] = 'auto'
          const { projection, transform, dimensions } = this.getCanvasProperties([lon, lat], scale / prevState.initialScale, prevState.initialScale, prevState.projection, prevState.viewCenter)
          return {
            projection: projection,
            transform: transform,
            dimensions: dimensions
          }
        })
      }

      if (framesCount % 2 === 0) return

      const curX = this.xAnimator.tick(2)
      const curY = this.yAnimator.tick(2)
      const curK = this.kAnimator.tick(2)

      this.container.style['transform-origin'] = `${this.state.viewCenter[0]}px ${this.state.viewCenter[1]}px`
      this.container.style['transform'] = `scale(${curK}, ${curK}) translate(${curX}px, ${curY}px)` // css transforms are applied right-to-left
    }
  }

  onDoubleClickMap (e) {
    if (window.getSelection) {
      window.getSelection().empty() // double clicking causes text to be highlighted in many browsers
    }
    e.preventDefault()
    const latLon = this.getCoordinatesFromClickEvent(e)
    const zoomLevel = this.state.projection.scale() / this.state.initialScale
    const scale = this.getScale(zoomLevel * 2)
    this.zoomTo(latLon, scale)
    return false
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
  }

  // for debugging
  onClick (e) {
    console.log(this.getCoordinatesFromClickEvent(e))
  }

  zoom (inOrOut) {
    const zoomLevel = this.state.projection.scale() / this.state.initialScale
    const scale = inOrOut === 'in' ? this.getScale(zoomLevel * 2) : this.getScale(zoomLevel / 2)
    const x = this.state.viewCenter[0] - this.state.transform.x
    const y = this.state.viewCenter[1] - this.state.transform.y
    const latLon = this.state.projection.invert([x, y])
    this.zoomTo(latLon, scale)
  }

  getCoordinatesFromClickEvent (e) {
    const { top, left } = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    return this.state.projection.invert([x, y])
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
      <div className='ZoomMap-container'>
        <div
          style={style}
          className='ZoomMap'
          onClick={this.onClick.bind(this)}
          // onMouseMove={this.onMouseMove.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onDoubleClick={this.onDoubleClickMap.bind(this)}
          ref={(el) => { this.container = el }} >
          {this.state.projection ? (
            <PureComponent
              projection={this.state.projection}
              dimensions={this.state.dimensions}
              {...this.props}>{this.props.children}</PureComponent>
          ) : null}
        </div>
        <Controls zoomIn={this.zoom.bind(this, 'in')} zoomOut={this.zoom.bind(this, 'out')} />
      </div>
    )
  }
}

ZoomMap.propTypes = {
  geoJSON: PropTypes.object.isRequired, // really only need these to get the center and extent for fitting
  focus: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoomLevel: PropTypes.number.isRequired,
  transitionSpringForces: PropTypes.arrayOf(PropTypes.number),
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number.isRequired
}

ZoomMap.defaultProps = {
  transitionSpringForces: [0.05, 0.45],
  minZoom: 1
}

class Controls extends React.PureComponent {
  render () {
    return (
      <div className='Controls'>
        <button onClick={this.props.zoomIn.bind(this)}>+</button>
        <button onClick={this.props.zoomOut.bind(this)}>–</button>
      </div>
    )
  }
}

class PureComponent extends React.PureComponent {
  shouldComponentUpdate (props) {
    return (
      this.props.projection !== props.projection ||
      this.props.dimensions !== props.dimensions ||
      this.props.showDistricts !== props.showDistricts || // BREAKS ENCAPSULATION FIXME
      this.props.districts !== props.districts || // BREAKS ENCAPSULATION FIXME
      this.props.hoveredDistrict !== props.hoveredDistrict // BREAKS ENCAPSULATION FIXME
    )
  }

  render () {
    return <this.props.children
      projection={this.props.projection}
      dimensions={this.props.dimensions}
      {...this.props} />
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
