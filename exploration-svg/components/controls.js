import React from 'react'

export default class Controls extends React.Component {
  render () {
    return (
      <div className='controls'>
        {this.props.controls.map(({ label, settingsKey, values }) => {
          const buttons = values.map((v) => {
            const value = Array.isArray(v) ? v[0] : v
            return {
              value: value,
              label: Array.isArray(v) ? v[1] : v,
              selected: this.props.settings[settingsKey] === value
            }
          })
          const onSelect = (val) => this.props.onChange({ [settingsKey]: val })
          return (
            <ButtonGroup label={label} buttons={buttons} onSelect={onSelect} />
          )
        })}
      </div>
    )
  }
}

function ButtonGroup ({ label, buttons, onSelect }) {
  return (
    <div className='button-group'>
      <div className='label'>{label}</div>
      <div className='buttons'>
        {buttons.map(({ label, value, selected }) => (
          <div className={selected ? 'selected' : ''} onClick={() => onSelect(value)}>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
