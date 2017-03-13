import React from 'react'
import { GUI } from 'dat-gui'

export default class Controls extends React.Component {
  componentDidMount () {
    const settings = {...this.props.settings}
    const onChange = () => {
      this.props.onChange(settings)
    }
    const gui = new GUI({ autoPlace: false })
    for (let prop in this.props.controls) {
      gui.add(settings, prop, ...this.props.controls[prop]).onFinishChange(onChange)
    }
    this.el.appendChild(gui.domElement)
  }

  render () {
    return (
      <div style={{position: 'absolute', right: 10}} ref={(el) => { this.el = el }} />
    )
  }
}
