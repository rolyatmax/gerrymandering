import React from 'react'

// TODO: should notePosition be determined programatically?
export default class Annotation extends React.Component {
  constructor () {
    super()
    this.state = {
      textHeight: 100,
      textWidth: 100
    }
  }

  componentDidMount () {
    const { width, height } = this.textEl.getBoundingClientRect()
    this.setState({
      textHeight: height,
      textWidth: width
    })
  }

  render () {
    const { x, y, dx, dy, text, circleSize } = this.props
    const noteX = x + dx
    const noteY = y + dy
    const isNoteBelowSubject = noteY > y
    const isNoteRightOfSubject = noteX > x
    const TWO_PI = Math.PI * 2

    // find pointA, the point closest to the subject
    let radiansFromSubject
    if (isNoteRightOfSubject) {
      radiansFromSubject = isNoteBelowSubject ? 0.125 * TWO_PI : 0.875 * TWO_PI
    } else {
      radiansFromSubject = isNoteBelowSubject ? 0.375 * TWO_PI : 0.625 * TWO_PI
    }

    const pointA = [
      Math.cos(radiansFromSubject) * (circleSize + 10) + x,
      Math.sin(radiansFromSubject) * (circleSize + 10) + y
    ]

    // find pointC, the point closest to the annotation text
    const pointC = [
      noteX + (isNoteRightOfSubject ? this.state.textWidth : 0),
      noteY + (isNoteBelowSubject ? -this.state.textHeight - 5 : 5)
    ]

    // find pointB, the intersection of the two lines using y = mx + b formula
    const angledSegmentM = (pointA[1] - y) / (pointA[0] - x)
    const angledSegmentB = pointA[1] - angledSegmentM * pointA[0]

    const pointB = [
      (pointC[1] - angledSegmentB) / angledSegmentM,
      pointC[1]
    ]

    const d = `M ${pointA.join(' ')} L ${pointB.join(' ')} L ${pointC.join(' ')}`
    const annotationColor = 'rgba(30, 30, 30, 0.7)'

    // figure out text wrapping here
    const lines = wrapAtMaxCharLength(text, 30)
    const textEls = lines.map((line, i) => <tspan key={i}>{line}</tspan>)

    function wrapAtMaxCharLength (text, maxChars) {
      const words = text.split(' ')
      const lines = []
      let curLine = []

      while (words.length) {
        const word = words.shift()
        curLine.push(word)
        if (curLine.join(' ').length > maxChars) {
          curLine.pop()
          lines.push(curLine)
          curLine = [word]
        }
      }

      if (curLine.length) lines.push(curLine)
      return lines.map(line => line.join(' '))
    }

    return (
      <g className='annotation'>
        <circle cx={x} cy={y} r={circleSize} fill='transparent' stroke={annotationColor} />
        <path d={d} fill='transparent' stroke={annotationColor} />
        <text ref={(el) => { this.textEl = el }} x={noteX} y={noteY}>{textEls}</text>
      </g>
    )
  }
}
