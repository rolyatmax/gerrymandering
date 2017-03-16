import React from 'react'
import keyBy from 'lodash/keyBy'
import sortBy from 'lodash/sortBy'
import { getValuesForDimension, getWinnerMargin } from '../helpers'

export default function DistrictMargins ({settings, districts, totals, setSelectedDistrict}) {
  const district = districts[settings.district]
  const districtTotals = keyBy(totals[settings.district].data, 'district-name')

  const sliderWidth = 250
  const textWidth = 170
  const width = sliderWidth + textWidth
  const sliderHeight = 5
  const padding = 12
  const height = district.data.length * (sliderHeight + padding)

  const districtSVGs = sortBy(district.data, feat => {
    return parseInt(feat.properties.NAMELSAD.match(/\d+/)[0], 10)
  }).map((feat, i) => {
    const districtName = feat.properties.NAMELSAD
    const values = getValuesForDimension(districtTotals[districtName], settings)
    const { winner, margin } = getWinnerMargin(values, settings)
    const marginInPixels = margin / textWidth * sliderWidth
    const xPosition = textWidth + sliderWidth / 2 + (winner === 'democrat' ? -marginInPixels : marginInPixels)
    const blue = `rgba(${settings.colors.democrat.join(', ')}, 0.7)`
    const red = `rgba(${settings.colors.republican.join(', ')}, 0.7)`
    const opacity = settings.selectedDistrict && settings.selectedDistrict !== districtName ? 0.4 : 1
    return (
      <g key={districtName} className='district' transform={`translate(0, ${(sliderHeight + padding) * i + padding})`} style={{ opacity, transition: 'opacity 100ms linear' }}>
        <text>{districtName}</text>
        <g className='slider' transform='translate(0, -8)'>
          <rect x={sliderWidth / 2 + textWidth} y='0' width={sliderWidth / 2} height={sliderHeight} fill={red} />
          <rect x={textWidth} y='0' width={sliderWidth / 2} height={sliderHeight} fill={blue} />
          <circle cx='0' cy={sliderHeight / 3} r={sliderHeight} style={{transform: `translate(${xPosition}px, 0)`, transition: 'transform 300ms cubic-bezier(0.17, 0.67, 0.53, 0.98)'}} />
        </g>
      </g>
    )
  })

  return (
    <div className='district-margins'>
      <h3>{district.name}</h3>
      <svg width={width} height={height}>
        {districtSVGs}
      </svg>
    </div>
  )
}
