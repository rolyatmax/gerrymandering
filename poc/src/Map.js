import React from 'react'
import ZoomMap from './ZoomMap'
import * as d3 from 'd3'
import chroma from 'chroma-js'
import quadInOut from 'eases/quad-in-out'
import classnames from 'classnames'
import numeral from 'numeral'
import './Map.css'

export default class MapContainer extends React.PureComponent {
  render () {
    const { tracts, focus, zoomLevel } = this.props
    return (
      <ZoomMap
        geoJSON={tracts}
        focus={focus}
        zoomLevel={zoomLevel}
        transitionEasing={quadInOut}
        transitionDuration={800}
        minZoom={1}
        maxZoom={8}
        {...this.props}>
        {Map}
      </ZoomMap>
    )
  }
}

MapContainer.propTypes = {
  demographic: React.PropTypes.string.isRequired,
  tracts: React.PropTypes.object.isRequired,
  districts: React.PropTypes.object.isRequired,
  focus: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  zoomLevel: React.PropTypes.number.isRequired,
  showDistricts: React.PropTypes.bool.isRequired,
  highlightedDistricts: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
}

class Map extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      hoveredDistrictID: null,
      mouse: [0, 0]
    }
  }

  setHoveredDistrict (districtID) {
    this.setState({
      hoveredDistrictID: districtID
    })
  }

  mouseMove (e) {
    const mouse = [e.clientX - this.left, e.clientY - this.top]
    this.setState({ mouse })
  }

  setOffsets () {
    const { top, left } = this.container.getBoundingClientRect()
    this.top = top
    this.left = left
  }

  componentDidMount () {
    this.drawMap()
    this.setOffsets()
  }

  componentDidUpdate (prevProps) {
    this.setOffsets()
    if (this.props.projection && this.props.projection !== prevProps.projection) {
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
    const { projection, dimensions, districts, showDistricts, highlightedDistricts, demographic } = this.props
    const [width, height] = dimensions

    let orderedFeatures = districts.features.slice()
    if (this.state.hoveredDistrictID) {
      orderedFeatures = findByIDAndMoveToEnd(orderedFeatures, this.state.hoveredDistrictID)
    }

    highlightedDistricts.forEach(id => {
      orderedFeatures = findByIDAndMoveToEnd(orderedFeatures, id)
    })

    const hoveredDistrict = districts.features.find(feat => feat.properties.id === this.state.hoveredDistrictID)

    const svgStyle = {
      width: `${width}px`,
      height: `${height}px`
    }
    const svgPath = d3.geoPath(projection)
    return (
      <div ref={(el) => { this.container = el }}>
        <canvas ref={(el) => { this.ctx = el && el.getContext('2d') }} />
        <svg width={width} height={height} style={svgStyle}>
          {orderedFeatures.map(feat => {
            const isHighlighted = highlightedDistricts.includes(feat.properties.id)
            const className = classnames('district', {
              hidden: !showDistricts,
              faded: highlightedDistricts.length && !isHighlighted,
              highlighted: isHighlighted,
              hovered: this.state.hoveredDistrictID === feat.properties.id
            })
            return (
              <path
                d={svgPath(feat)}
                className={className}
                key={feat.properties.id}
                onMouseMove={(e) => this.mouseMove(e)}
                onMouseEnter={() => this.setHoveredDistrict(feat.properties.id)}
                onMouseLeave={() => this.setHoveredDistrict(null)}
              />
            )
          })}
        </svg>
        {/* <ToolTip demographic={demographic} district={districts.features[0]} mouse={[900, 500]} /> */}
        {this.state.hoveredDistrictID ? (
          <ToolTip demographic={demographic} district={hoveredDistrict} mouse={this.state.mouse} />
        ) : null}
      </div>
    )
  }
}

function ToolTip ({ district, mouse, demographic }) {
  const padding = 30
  const style = {
    top: mouse[1] + padding,
    left: mouse[0] - padding - 200 // the width
  }

  const demographics = {
    ethnicity: [
      // TODO: pull these color defs out
      { label: 'Hispanic', prop: 'ethnicity:hispanic', color: [115, 174, 128] },
      { label: 'Non-Hispanic', prop: 'ethnicity:non-hispanic', color: [108, 131, 181] }
    ],
    race: [
      { label: 'Non-White', prop: 'race:non-white', color: [115, 174, 128] },
      { label: 'White', prop: 'race:white', color: [108, 131, 181] }
    ]
  }

  const counts = demographics[demographic].map(({ label, prop, color }) => (
    <li key={label}>
      <div className='color-box' style={{ backgroundColor: `rgba(${color.join(',')}, 0.8)` }} />
      <span className='label'>{label}</span>
      <span className='count'>{numeral(district.properties[prop]).format('0.0a')}</span>
    </li>
  ))

  const demoTotal = demographics[demographic].reduce((total, demo) => total + district.properties[demo.prop], 0)
  const sliderStyles = demographics[demographic].map(({ color, prop }, i) => ({
    backgroundColor: `rgba(${color.join(',')}, 0.8)`,
    width: `${district.properties[prop] / demoTotal * 100 - 0.5}%`,
    left: i === 0 ? 0 : 'auto',
    right: i === 0 ? 'auto' : 0
  }))

  return (
    <div className='tooltip' style={style}>
      <h4>{district.properties.id}</h4>
      <ul>{counts}</ul>
      <div className='slider'>
        <div className='slice' style={sliderStyles[0]} key={0} />
        <div className='slice' style={sliderStyles[1]} key={1} />
      </div>
    </div>
  )
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

function findByIDAndMoveToEnd (list, id) {
  list = list.slice()
  const idx = list.findIndex(feat => feat.properties.id === id)
  const toMove = list.splice(idx, 1)[0]
  list.push(toMove)
  return list
}

// polyfill for Firefox
Array.prototype.includes = Array.prototype.includes || function (item) {
  return this.indexOf(item) > -1
}
