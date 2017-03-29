/* global fetch */

import React, { Component } from 'react'
import Map from './Map'
import lorem from 'lorem-ipsum'
import './App.css'
import '../node_modules/font-awesome/css/font-awesome.min.css'

export default class App extends Component {
  constructor () {
    super()
    this.state = {
      tracts: null,
      currentSection: 0
    }
  }

  componentDidMount () {
    fetch('/data/tx-census-tracts-2010.json')
      .then(res => res.json())
      .catch((err) => { throw new Error(err) })
      .then(tracts => this.setState(() => ({ tracts })))
  }

  render () {
    const { tracts, currentSection } = this.state
    const transform = { x: 0, y: 0, k: 1 } // { x: 100, y: 0, k: 1.2 } // { x: 0, y: 0, k: 1 }
    return (
      <div className='App'>
        <Header />
        <div className='content-container'>
          {tracts ? <Map currentSection={currentSection} tracts={tracts} demographic='race' transform={transform} /> : null}
          <div className='content'>
            <div className='above-fold'>
              <section className='intro'>
                <h1 className='headline'>Local Headline Wins Heart of Pulitzer Board</h1>
                <div className='authors'>By Chris Geidner and Taylor Baldwin</div>
                <div className='publish-time'>April 14, 2017, 4:15 p.m.</div>
              </section>
              <section className='description'>
                <span>Aliqua Lorem nulla esse occaecat fugiat aute. Consectetur anim esse amet labore ipsum fugiat magna proident irure veniam reprehenderit. Nulla aliquip aliqua cupidatat dolor culpa anim aliquip enim.</span>
                <ScrollIndicator currentSection={currentSection} />
              </section>
            </div>
            <div className='below-fold'>
              <p>{lorem({count: 3, units: 'sentences'})}</p>
              <p>{lorem({count: 3, units: 'sentences'})}</p>
              <p>{lorem({count: 3, units: 'sentences'})}</p>
              <ByLines />
              <ShareButtons />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function ScrollIndicator ({ currentSection }) {
  const className = `scroll-indicator ${currentSection !== 0 ? 'hidden' : ''}`
  return (
    <div className={className}>
      <div>scroll</div>
      <div className='arrow' />
    </div>
  )
}

function ByLines () {
  return (
    <div className='bylines'>
      <div className='byline'>
        <img src='/img/chrisgeidner-avatar.jpg' alt='Chris Geidner' />
        <a href='#' className='byline__name'>Chris Geidner</a>
        <div className='byline__title'>BuzzFeed News Reporter</div>
      </div>
      <div className='byline'>
        <img src='/img/taylorbaldwin-avatar.jpg' alt='Taylor Baldwin' />
        <a href='#' className='byline__name'>Taylor Baldwin</a>
        <div className='byline__title'>Editorial Developer</div>
      </div>
    </div>
  )
}

function ShareButtons () {
  return (
    <div className='share-buttons'>
      <div className='circle-share facebook'><div className='fa fa-facebook' /></div>
      <div className='circle-share twitter'><div className='fa fa-twitter' /></div>
      <div className='circle-share email'><div className='fa fa-envelope email_icon' /></div>
    </div>
  )
}

function Header () {
  return (
    <header>
      <div className='header-container'>
        <div className='logo' />
        <div className='news-section'>USNews</div>
      </div>
    </header>
  )
}
