/* global fetch Waypoint */

import React, { Component } from 'react'
import '../node_modules/waypoints/lib/noframework.waypoints.js' // exposes Waypoint
import Map from './Map'
import lorem from 'lorem-ipsum'
import './App.css'
import '../node_modules/font-awesome/css/font-awesome.min.css'

const CENTRAL_TX_COORDS = [-99.1117, 31.7675]
const DALLAS_COORDS = [-96.9707, 32.6862]
const SAN_ANTONIO_COORDS = [-97.9002, 29.8582]
const HOUSTON_COORDS = [-95.3765, 29.7556]

const sections = [
  {
    focus: CENTRAL_TX_COORDS,
    zoomLevel: 1.25,
    demographic: 'ethnicity',
    showDistricts: false,
    highlightedDistricts: []
  },
  {
    focus: HOUSTON_COORDS,
    zoomLevel: 5.5,
    demographic: 'race',
    showDistricts: false,
    highlightedDistricts: []
  },
  {
    focus: HOUSTON_COORDS,
    zoomLevel: 5.5,
    demographic: 'race',
    showDistricts: true,
    highlightedDistricts: ['TX-9', 'TX-18']
  },
  {
    focus: SAN_ANTONIO_COORDS,
    zoomLevel: 4.5,
    demographic: 'ethnicity',
    showDistricts: false,
    highlightedDistricts: []
  },
  {
    focus: SAN_ANTONIO_COORDS,
    zoomLevel: 4.5,
    demographic: 'ethnicity',
    showDistricts: true,
    highlightedDistricts: ['TX-20', 'TX-35']
  },
  {
    focus: DALLAS_COORDS,
    zoomLevel: 5.5,
    demographic: 'ethnicity',
    showDistricts: false,
    highlightedDistricts: []
  },
  {
    focus: DALLAS_COORDS,
    zoomLevel: 5.5,
    demographic: 'ethnicity',
    showDistricts: true,
    highlightedDistricts: ['TX-33']
  }
]

const texts = sections.map(() => lorem({count: 3, units: 'sentences'}))

export default class App extends Component {
  constructor () {
    super()
    this.state = {
      tracts: null,
      currentSection: 0
    }
    window.setSection = (i) => this.setState({ currentSection: i })
  }

  componentDidMount () {
    sections.forEach((section, i) => {
      new Waypoint({
        element: document.querySelector(`[data-section="${i}"]`),
        offset: '60%',
        handler: (direction) => {
          console.log('section', i, direction)
          const section = direction === 'down' ? i : i - 1
          this.setState({ currentSection: section })
        }
      })
    })

    const tractsPromise = fetch('/data/tx-census-tracts-2010.json')
      .then(res => res.json())

    const districtsPromise = fetch('/data/tx-congressional-districts-2015-simplified.json')
      .then(res => res.json())

    Promise.all([tractsPromise, districtsPromise])
      .catch((err) => { throw new Error(err) })
      .then(([tracts, districts]) => this.setState(() => ({ tracts, districts })))
  }

  render () {
    const { tracts, districts, currentSection } = this.state
    return (
      <div className='App'>
        <Header />
        <div className='content-container'>
          {tracts ? (
            <Map
              tracts={tracts}
              districts={districts}
              showDistricts={sections[currentSection].showDistricts}
              demographic={sections[currentSection].demographic}
              focus={sections[currentSection].focus}
              zoomLevel={sections[currentSection].zoomLevel}
              highlightedDistricts={sections[currentSection].highlightedDistricts} />
          ) : null}
          <div className={`content ${currentSection > 0 ? 'with-background' : ''}`}>
            <div className='above-fold'>
              <section className='intro' data-section={0}>
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
              <section data-section={1}>
                <h2>Houston</h2>
                <p>{texts[0]}</p>
              </section>
              <section data-section={2}>
                <h3>TX-9 & TX-18</h3>
                <p>{texts[2]}</p>
              </section>
              <section data-section={3}>
                <h2>I-35 Between Austin & San Antonio</h2>
                <p>{texts[1]}</p>
              </section>
              <section data-section={4}>
                <h3>TX-20 & TX-35</h3>
                <p>{texts[3]}</p>
              </section>
              <section data-section={5}>
                <h2>Dallas</h2>
                <p>{texts[2]}</p>
              </section>
              <section data-section={6}>
                <h3>TX-33</h3>
                <p>{texts[0]}</p>
              </section>
            </div>
          </div>
          <div className='footer'>
            <section>
              <ByLines />
              <ShareButtons />
            </section>
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
