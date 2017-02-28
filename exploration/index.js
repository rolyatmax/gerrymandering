import {GUI} from 'dat-gui'
import array from 'new-array'
import Sketch from 'sketch-js'
import precincts from './data/nc-precincts.json'

const container = document.querySelector('.container')

const settings = {
  blueDotCount: 600,
  redDotCount: 450
}

const colors = [
  [144, 180, 180],
  [255, 78, 180]
]

const gui = new GUI()
gui.add(settings, 'blueDotCount', 10, 10000).step(10).onChange(reset)
gui.add(settings, 'redDotCount', 10, 10000).step(10).onChange(reset)
gui.add({ reset }, 'reset')

function reset () {
  sketch.reset()
}

const sketch = Sketch.create({
  container: container,
  setup () {
    this.reset()
  },

  resize () {
    this.reset()
  },

  reset () {
    const { height, width } = this.canvas
    this.center = [width / 2 | 0, height / 2 | 0]
    const { blueDotCount, redDotCount } = settings
    this.curLine = []
    this.boundaries = []
    this.dots = [].concat(
      this.createDots(blueDotCount, '#00f'),
      this.createDots(redDotCount, '#f00')
    )
  },

  draw () {
    this.dots.forEach(({position, color}) => drawCircle(this, position, 2, color))
    this.boundaries.forEach((line, i) => {
      const color = colors[i % colors.length]
      fillShape(this, line, `rgba(${color.join(', ')}, 0.2)`)
    })
    if (this.dragging && this.curLine.length) {
      drawLine(this, this.curLine, '#333')
    }
  },

  mousedown () {
    this.curLine = []
  },

  mouseup () {
    if (this.curLine.length > 1) {
      const line = this.curLine.concat([this.curLine[0]])
      this.boundaries.push(line)
    }
    this.curLine = []
  },

  mousemove () {
    if (!this.dragging) return
    const lastPt = this.curLine[this.curLine.length - 1]
    if (lastPt && this.mouse.x === lastPt[0] && this.mouse.y === lastPt[1]) return
    this.curLine.push([this.mouse.x, this.mouse.y])
  },

  createDots (count, color) {
    const { height, width } = this.canvas
    const diameter = Math.min(height, width)
    const maxMagnitude = (diameter / 2 - diameter * 0.05) | 0
    return array(count).map(() => {
      const rads = Math.random() * Math.PI * 2
      const mag = Math.pow(Math.random(), 0.5) * maxMagnitude
      return {
        position: [Math.cos(rads) * mag + this.center[0], Math.sin(rads) * mag + this.center[1]],
        color: color
      }
    })
  }
})

function drawCircle (ctx, position, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(position[0], position[1], radius, 0, Math.PI * 2)
  ctx.fill()
}

function fillShape (ctx, points, color) {
  const start = points[0]
  ctx.fillStyle = color
  ctx.lineWidth = 0
  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  points.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]))
  ctx.fill()
}

function drawLine (ctx, points, color) {
  const start = points[0]
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  points.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]))
  ctx.stroke()

  ctx.save()
  const lastPt = points[points.length - 1]
  ctx.beginPath()
  ctx.setLineDash([15, 15])
  ctx.moveTo(lastPt[0], lastPt[1])
  ctx.lineTo(start[0], start[1])
  ctx.stroke()
  ctx.restore()
}
