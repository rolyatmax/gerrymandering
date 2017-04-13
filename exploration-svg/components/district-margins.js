/* global requestAnimationFrame */

import React from 'react'
import * as d3 from 'd3'
import keyBy from 'lodash/keyBy'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'
import { getValuesForDimension, getWinnerMargin } from '../helpers'

// the margin below which a race is considered competitive
const LEAN_MARGIN = 10
const TOSSUP_MARGIN = 2

export default function DistrictMargins ({settings, districts, totals, setSelectedDistrict}) {
  const districtTotals = keyBy(totals.data, 'district-name')

  let districtData = districts.data.features.map((feat, i) => {
    const districtName = feat.properties.NAMELSAD
    // tmp: remove me
    const hispanic = feat.properties['ethnicity:hispanic']
    const nonHispanic = feat.properties['ethnicity:non-hispanic']
    const values = { hispanic, nonHispanic }
    // const values = getValuesForDimension(districtTotals[districtName], settings.race)
    // tmp ^^^^
    const { winner, margin } = getWinnerMargin(values, settings)
    // debugger;
    return {
      districtName: districtName,
      districtNumber: parseInt(districtName.match(/\d+/)[0], 10),
      winner: winner,
      margin: margin
    }
  })

  districtData = sortBy(districtData, ({ districtNumber }) => districtNumber)

  let style = {}
  if (settings.demographic) {
    style = { visibility: 'hidden', 'pointerEvents': 'none' }
  }

  return (
    <div className='district-margins' style={style}>
      <h3>District Margins</h3>
      <p>The percentage of districts which are majority democrat, lean democrat, toss-ups, lean republican,
         or majority republican. <span className='note'>{`Note: a district merely leans towards one party if the size of the
         lead is less than ${LEAN_MARGIN} percentage points and is a toss-up if the lead is less than ${TOSSUP_MARGIN} percentage points`}</span></p>
      <PieChart key={settings.usState} districts={districtData} settings={settings} />
      <ul>
        {districtData.map(({ districtName, districtNumber, winner, margin }) => {
          const isFaded = settings.selectedDistrict && settings.selectedDistrict !== districtName

          function onMouseEnter () {
            setSelectedDistrict(districtName)
          }

          function onMouseLeave () {
            if (settings.selectedDistrict === districtName) {
              setSelectedDistrict(null)
            }
          }

          return (
            <li onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} key={districtName} className={`district ${isFaded ? 'fade' : ''}`}>
              <span>{`${settings.usState.toUpperCase()}-${districtNumber}`}</span>
              <div className='slider'>
                <div className='margin dem' style={{ width: winner === 'hispanic' ? `${margin / 2}%` : 0 }} />
                <div className='margin rep' style={{ width: winner === 'nonHispanic' ? `${margin / 2}%` : 0 }} />
                <div className='margin dem background' />
                <div className='margin rep background' />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

class PieChart extends React.Component {
  constructor (props) {
    super(props)
    const slices = this.getSlices(props).map(slice => ({
      ...slice,
      curStartAngle: slice.startAngle,
      curEndAngle: slice.endAngle
    }))
    this.state = { slices }
  }

  getSlices (props) {
    const { districts } = props
    const groups = groupBy(districts, ({ margin, winner }) => {
      return margin <= TOSSUP_MARGIN ? 'toss-up' : margin <= LEAN_MARGIN ? `lean-${winner}` : winner
    })
    let curAngle = Math.PI * 1.5
    return ['hispanic', 'lean-hispanic', 'toss-up', 'lean-nonHispanic', 'nonHispanic'].map(group => {
      const name = group
      const count = groups[group] ? groups[group].length : 0
      const startAngle = curAngle
      const endAngle = count / districts.length * Math.PI + curAngle
      curAngle = endAngle
      return { name, count, startAngle, endAngle }
    })
  }

  componentWillReceiveProps (nextProps) {
    const nextSlices = this.getSlices(nextProps)
    const slices = this.state.slices.map((slice, i) => ({
      ...slice,
      ...nextSlices[i]
    }))
    this.setState({ slices })
    requestAnimationFrame(this.animate.bind(this))
  }

  animate () {
    const ANIMATION_STEP = 0.1
    let continueAnimating = false
    const slices = this.state.slices.map((slice) => {
      const startAngleDelta = slice.startAngle - slice.curStartAngle
      const endAngleDelta = slice.endAngle - slice.curEndAngle
      const curStartAngle = Math.abs(startAngleDelta) < 0.01 ? slice.startAngle : slice.curStartAngle + startAngleDelta * ANIMATION_STEP
      const curEndAngle = Math.abs(endAngleDelta) < 0.01 ? slice.endAngle : slice.curEndAngle + endAngleDelta * ANIMATION_STEP
      continueAnimating = continueAnimating || curStartAngle !== slice.startAngle || curEndAngle !== slice.endAngle
      return { ...slice, curStartAngle, curEndAngle }
    })
    if (continueAnimating) {
      requestAnimationFrame(this.animate.bind(this))
    }
    this.setState({ slices })
  }

  render () {
    const { settings } = this.props
    const colors = {
      'hispanic': [...settings.colors.democrat, 1],
      'lean-hispanic': [...settings.colors.democrat, 0.7],
      'toss-up': [...averageColors(settings.colors.democrat, settings.colors.republican), 0.2],
      'lean-nonHispanic': [...settings.colors.republican, 0.7],
      'nonHispanic': [...settings.colors.republican, 1]
    }

    const width = 300
    const height = 150
    const arc = d3.arc().innerRadius(50).outerRadius(Math.min(height, width / 2) - 20)
    return (
      <svg height={height} width={width}>
        <g transform={`translate(${width / 2}, ${height - 20})`}>
          {this.state.slices.map(({ curStartAngle, curEndAngle, color, name }) =>
            <path
              key={name}
              className='pie-chart-slice'
              d={arc.startAngle(curStartAngle).endAngle(curEndAngle)()}
              fill={`rgba(${colors[name].join(',')})`} />
          )}
        </g>
      </svg>
    )
  }
}

function averageColors (color1, color2) {
  const [r1, g1, b1] = color1
  const [r2, g2, b2] = color2
  return [
    (r1 + r2) / 2 | 0,
    (g1 + g2) / 2 | 0,
    (b1 + b2) / 2 | 0
  ]
}
