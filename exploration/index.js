import {GUI} from 'dat-gui'
import array from 'new-array'
import Sketch from 'sketch-js'

const container = document.querySelector('.container')

const settings = {
  dotCount: 500,
  bluePerc: 15
}

const colors = [
  [144, 180, 180],
  [255, 78, 180]
]

const gui = new GUI()
gui.add(settings, 'dotCount', 10, 10000).step(10).onChange(reset)
gui.add(settings, 'bluePerc', 1, 100).onChange(reset)
gui.add({ reset }, 'reset')

function reset () {
  sketch.reset()
}

const sketch = Sketch.create({
  container: container,
  setup () {
    const { height, width } = this.canvas
    this.center = [width / 2 | 0, height / 2 | 0]
    this.reset()
  },

  reset () {
    this.curLine = []
    this.boundaries = []
    this.createDots()
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

  createDots () {
    const { height, width } = this.canvas
    const diameter = Math.min(height, width)
    const maxMagnitude = (diameter / 2 - diameter * 0.05) | 0
    this.dots = array(settings.dotCount).map(() => {
      const rads = Math.random() * Math.PI * 2
      const mag = Math.random() * maxMagnitude
      return {
        position: [Math.cos(rads) * mag + this.center[0], Math.sin(rads) * mag + this.center[1]],
        color: Math.random() * 100 < settings.bluePerc ? '#00f' : '#f00'
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
}
