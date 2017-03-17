import sortBy from 'lodash/sortBy'

export function getValuesForDimension (counts, settings) {
  const values = {}
  for (let dim in counts) {
    const [dimName, val] = dim.split(':')
    if (dimName === settings.race) {
      values[val] = counts[dim]
    }
  }
  return values
}

export function getWinnerMargin (dimensionCounts, settings) {
  const sortedDimensions = sortBy(
    Object.keys(dimensionCounts).map(dim => ([dim, parseInt(dimensionCounts[dim], 10)])),
    [([dim, count]) => -count]
  )
  const total = sortedDimensions.reduce((t, [, count]) => t + count, 0)
  const [winner, winnerCount] = sortedDimensions[0]
  const winnerPerc = winnerCount / total
  const secondPlacePerc = sortedDimensions[1][1] / total
  const margin = (winnerPerc - secondPlacePerc) * 100 | 0
  return { winner, margin }
}
