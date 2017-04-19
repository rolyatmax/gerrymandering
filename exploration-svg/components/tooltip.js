import React from 'react'
import numeral from 'numeral'

export default function ToolTip ({ district, position, demographic }) {
  const padding = 30
  const style = {
    position: 'absolute',
    top: position[1] - padding,
    left: position[0] - padding,
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(20, 20, 20, 0.1)',
    padding: '10px 20px'
  }

  const demographics = {
    ethnicity: [
      // TODO: pull these color defs out
      { label: 'Hispanic', prop: 'ethnicity:hispanic' },
      { label: 'Non-Hispanic', prop: 'ethnicity:non-hispanic' }
    ],
    race: [
      { label: 'Non-White', prop: 'race:non-white' },
      { label: 'White', prop: 'race:white' }
    ],
    minorities: [
      { label: 'Non-White', prop: 'race:non-white' },
      { label: 'White', prop: 'race:white' },
      { label: 'Hispanic', prop: 'ethnicity:hispanic' },
      { label: 'Non-Hispanic', prop: 'ethnicity:non-hispanic' }
    ]
  }

  const counts = demographics[demographic].map(({ label, prop, color }) => (
    <li key={label} style={{ padding: 5 }}>
      <div className='color-box' style={{ backgroundColor: `rgba(${color.join(',')}, 0.8)` }} />
      <span style={{ width: 120, display: 'inline-block' }} className='label'>{label}</span>
      <span className='count'>{numeral(district.properties[prop]).format('0.0a')}</span>
    </li>
  ))

  return (
    <div className='tooltip' style={style}>
      <h4 style={{ marginBottom: 10, fontSize: 22 }}>{district.properties.id}</h4>
      <ul>{counts}</ul>
    </div>
  )
}
