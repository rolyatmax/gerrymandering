import React from 'react'
import numeral from 'numeral'

export default function ToolTip ({ district, position, demographic }) {
  const padding = 30
  const tooltipHeight = 100
  const maxTooltipTop = window.innerHeight - tooltipHeight - padding
  const top = Math.min(position[1] + padding, maxTooltipTop)
  const style = {
    top: top,
    left: position[0] - padding - 200 // the width
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
