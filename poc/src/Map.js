import React from 'react'
import PropTypes from 'prop-types'
import ZoomMap from './ZoomMap'
import ToolTip from './ToolTip'
import * as d3 from 'd3'
import chroma from 'chroma-js'
import classnames from 'classnames'
import './Map.css'

export default class MapContainer extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      hoveredDistrictID: null,
      mouse: [0, 0]
    }
  }

  setHoveredDistrict (districtID) {
    this.setState({
      hoveredDistrictID: this.props.showTooltips ? districtID : null
    })
  }

  mouseMove (e) {
    const mouse = [e.clientX, e.clientY]
    this.setState({ mouse })
  }

  render () {
    const { tracts, focus, zoomLevel, demographic, districts } = this.props
    const hoveredDistrict = districts.features.find(feat => feat.properties.id === this.state.hoveredDistrictID)
    return (
      <div onMouseMove={(e) => this.mouseMove(e)}>
        <ZoomMap
          geoJSON={tracts}
          focus={focus}
          zoomLevel={zoomLevel}
          maxZoom={8}
          minZoom={1.1}
          hoveredDistrict={hoveredDistrict}
          setHoveredDistrict={this.setHoveredDistrict.bind(this)}
          {...this.props}>
          {Map}
        </ZoomMap>
        {hoveredDistrict ? (
          <ToolTip demographic={demographic} district={hoveredDistrict} position={this.state.mouse} />
        ) : null}
      </div>
    )
  }
}

MapContainer.propTypes = {
  demographic: PropTypes.string.isRequired,
  tracts: PropTypes.object.isRequired,
  districts: PropTypes.object.isRequired,
  focus: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoomLevel: PropTypes.number.isRequired,
  showDistricts: PropTypes.bool.isRequired,
  highlightedDistricts: PropTypes.arrayOf(PropTypes.string).isRequired,
  showTooltips: PropTypes.bool.isRequired
}

class Map extends React.PureComponent {
  componentDidMount () {
    this.drawMap()
  }

  componentDidUpdate (prevProps) {
    if (this.props.projection && this.props.projection !== prevProps.projection || this.props.districts !== prevProps.districts) {
      this.drawMap()
    }
  }

  drawMap () {
    const canvas = this.ctx.canvas
    const { tracts, demographic, projection, dimensions } = this.props
    const [width, height] = dimensions
    canvas.height = height
    canvas.width = width
    const path = d3.geoPath(projection).context(this.ctx)
    tracts.features.forEach((feat) => {
      this.ctx.beginPath()
      this.ctx.fillStyle = getColor(feat.properties, demographic)
      path(feat)
      this.ctx.fill()
    })
  }

  render () {
    const { projection, dimensions, districts, showDistricts, highlightedDistricts } = this.props
    const [width, height] = dimensions

    let orderedFeatures = districts.features.slice()

    highlightedDistricts.forEach(id => {
      orderedFeatures = findAndMoveToEnd(orderedFeatures, feat => feat.properties.id === id)
    })

    if (this.props.hoveredDistrict) {
      orderedFeatures = findAndMoveToEnd(orderedFeatures, feat => feat === this.props.hoveredDistrict)
    }

    const svgStyle = {
      width: `${width}px`,
      height: `${height}px`
    }
    const svgPath = d3.geoPath(projection)
    return (
      <div>
        <div ref={(el) => { this.container = el }}>
          <canvas ref={(el) => { this.ctx = el && el.getContext('2d') }} />
          <svg width={width} height={height} style={svgStyle}>
            {orderedFeatures.map(feat => {
              const isHighlighted = highlightedDistricts.includes(feat.properties.id)
              const className = classnames('district', {
                hidden: !showDistricts,
                faded: highlightedDistricts.length && !isHighlighted,
                highlighted: isHighlighted,
                hovered: this.props.hoveredDistrict === feat
              })
              return (
                <path
                  d={svgPath(feat)}
                  className={className}
                  key={feat.properties.id}
                  onMouseEnter={() => this.props.setHoveredDistrict(feat.properties.id)}
                  onMouseLeave={() => this.props.setHoveredDistrict(null)}
                />
              )
            })}
          </svg>
        </div>
      </div>
    )
  }
}

const colorMap = chroma.scale([[108, 131, 181], [115, 174, 128]]).mode('lab')
function getColor (properties, demographic) {
  const whiteCount = properties['race:white']
  const nonWhiteCount = properties['race:non-white']
  const raceTotal = whiteCount + nonWhiteCount
  const hispanicCount = properties['ethnicity:hispanic']
  const nonHispanicCount = properties['ethnicity:non-hispanic']
  const ethnicityTotal = hispanicCount + nonHispanicCount
  const total = demographic === 'race' ? raceTotal : ethnicityTotal

  let color = [180, 180, 180]
  if (total) {
    const leftHandSideDegree = demographic === 'race' ? nonWhiteCount / total : demographic === 'ethnicity' ? hispanicCount / total : 0
    color = colorMap(leftHandSideDegree).rgb()
  }

  const area = properties.CENSUSAREA
  const opacity = Math.max(0, Math.min(1, Math.pow(total / (area * 800), 0.3)))
  color.push(opacity)
  return `rgba(${color.join(',')})`
}

function findAndMoveToEnd (list, finder) {
  list = list.slice()
  const idx = list.findIndex(finder)
  const toMove = list.splice(idx, 1)[0]
  list.push(toMove)
  return list
}

// polyfill for Firefox
Array.prototype.includes = Array.prototype.includes || function (item) {
  return this.indexOf(item) > -1
}
