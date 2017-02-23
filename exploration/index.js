import {GUI} from 'dat-gui'
import yo from 'yo-yo'

const container = document.querySelector('.container')

const settings = {
  canvasSize: 500
}

// const gui = new GUI()
// gui.add(settings, 'canvasSize', 50, 1000).step(10).onChange(renderPage)

renderPage()

function renderPage () {
  const { canvasSize } = settings
  container.innerHTML = ''
  const canvas = yo`
    <canvas
      height=${canvasSize}
      width=${canvasSize}
      style="width: ${canvasSize}px; height: ${canvasSize}px;" />
  `

  const ctx = canvas.getContext('2d')
  renderViz(ctx)

  return yo`
    <div>
      <h2>gerrymandering exploration</h2>
      ${canvas}
    </div>
  `
}

function renderViz (ctx, screenshots, padding) {
  const { height, width } = ctx.canvas
  const center = [width / 2 | 0, height / 2 | 0]
  const maxMagnitude = (Math.min(height, width) / 2 | 0)
}

function drawArc (ctx, center, radius, startRad, endRad, width, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.arc(center[0], center[1], radius, startRad, endRad)
  ctx.stroke()
}

function drawCircle (ctx, position, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(position[0], position[1], radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawLine (ctx, start, end, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  ctx.lineTo(end[0], end[1])
  ctx.stroke()
}
