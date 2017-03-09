export function abbreviateNum (number) {
  const abbreviations = {
    1000000000: 'B',
    1000000: 'M',
    1000: 'K'
  }
  const limits = Object.keys(abbreviations).map(num => parseInt(num, 10)).sort((a, b) => b - a)
  for (let i = 0; i < limits.length; i++) {
    const limit = limits[i]
    if (number >= limit) {
      const shortened = number / limit
      const decimalPlaces = (shortened | 0) < 100 ? 1 : 0
      return shortened.toFixed(decimalPlaces) + abbreviations[limit]
    }
  }
  return `${number}`
}
