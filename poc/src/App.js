import React, { Component } from 'react'
import './App.css'
import '../node_modules/font-awesome/css/font-awesome.min.css'

class App extends Component {
  render () {
    return (
      <div className='App'>
        <Header />
        <div className='content-container'>
          <section className='opener'>
            <h1>Local Headline Wins Heart of Country</h1>
          </section>
          <section className='description'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </section>
        </div>
      </div>
    )
  }
}

export default App

function Header () {
  return (
    <header>
      <div className='header-container'>
        <div className='logo' />
        <div className='share-buttons'>
          <div className='circle-share facebook'><div className='fa fa-facebook' /></div>
          <div className='circle-share twitter'><div className='fa fa-twitter' /></div>
          <div className='circle-share email'><div className='fa fa-envelope email_icon' /></div>
        </div>
      </div>
    </header>
  )
}
