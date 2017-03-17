import React from 'react'
import keyBy from 'lodash/keyBy'
import sortBy from 'lodash/sortBy'
import { getValuesForDimension, getWinnerMargin } from '../helpers'

export default function DistrictMargins ({settings, districts, totals, setSelectedDistrict}) {
  const district = districts[settings['district-map']]
  const districtTotals = keyBy(totals[settings['district-map']].data, 'district-name')

  let districtData = district.data.map((feat, i) => {
    const districtName = feat.properties.NAMELSAD
    const values = getValuesForDimension(districtTotals[districtName], settings)
    const { winner, margin } = getWinnerMargin(values, settings)
    return {
      districtName: districtName,
      districtNumber: parseInt(districtName.match(/\d+/)[0], 10),
      winner: winner,
      margin: margin
    }
  })

  districtData = sortBy(districtData, ({ winner, margin, districtNumber }) => {
    if (settings.sort === 'name') {
      return districtNumber
    }
    return winner === 'democrat' ? margin * -1 : margin
  })

  return (
    <div className='district-margins'>
      <h3>District Margins</h3>
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
                <div className='margin dem' style={{ width: winner === 'democrat' ? `${margin / 2}%` : 0 }} />
                <div className='margin rep' style={{ width: winner === 'republican' ? `${margin / 2}%` : 0 }} />
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
