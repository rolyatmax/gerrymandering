/* global fetch  */

import {GUI} from 'dat-gui'
import * as d3 from 'd3'
import generatePoints from './generate-points'
import plotVoterRegistration from './plot-voter-registration'
import plotDistricts from './plot-congressional-districts'
import calculateRatios from './calculate-district-ratios'

window.d3 = d3

const STATE = 'nc'

const states = {
  fl: {
    precincts: 'fl-precincts.json',
    districts: ['fl-congressional-districts-2015-simplified.json']
  },
  'nc': {
    precincts: 'nc-precincts.json',
    districts: [
      'nc-congressional-districts-2013-simplified.json',
      'nc-congressional-districts-2015-simplified.json'
    ]
  },
  al: {
    precincts: 'al-precincts.json',
    districts: ['al-congressional-districts-2015-simplified.json']
  }
}

const filenames = states[STATE]

Promise.all([
  fetch(`data/${filenames.precincts}`).then(res => res.json()),
  ...filenames.districts.map(path => fetch(`data/${path}`).then(res => res.json()))
]).then(start)

function start ([precincts, ...districts]) {
  const scale = 8000
  const translate = [723, 691]
  const settings = {
    countPerDot: 30,
    calculationSampleRate: 10,
    alpha: 15,
    district: 0,
    democrat: true,
    libertarian: true,
    republican: true,
    unaffiliated: true,
    container: document.querySelector('.container'),
    scale: scale,
    projection: getProjection(scale, translate),
    translateX: translate[0],
    translateY: translate[1],
    colors: {
      democrat: [0, 0, 250],
      republican: [250, 0, 0],
      libertarian: [0, 250, 0],
      unaffiliated: [241, 244, 66]
    }
  }

  let points = generatePoints(settings, precincts)
  const drawVoterReg = plotVoterRegistration(settings)
  const drawDistricts = plotDistricts(settings)
  const renderDistrictRatios = calculateRatios(settings)

  window.settings = settings
  window.districts = districts
  window.points = points

  drawVoterReg(points)
  drawDistricts(districts[settings.district])
  renderDistrictRatios(districts[settings.district], points, precincts)

  function getProjection (scale, translate) {
    return d3.geoConicConformal()
      .rotate([79, -33 - 45 / 60])
      .fitExtent([[100, 200], [window.innerWidth - 100, window.innerHeight - 100]], {
        type: 'FeatureCollection',
        features: precincts
      })
      // .scale(scale)
      // .translate(translate)
  }

  // function updatePerspective () {
  //   const translate = [settings.translateX, settings.translateY]
  //   settings.projection = getProjection(settings.scale, translate)
  // }

  function onChangeVoterPlot () {
    drawVoterReg(points)
  }

  function onChangeDistricts () {
    drawDistricts(districts[settings.district])
    renderDistrictRatios(districts[settings.district], points, precincts)
  }

  function toggleDistrict () {
    settings.district += 1
    settings.district = settings.district % districts.length
    onChangeDistricts()
  }

  const gui = new GUI()
  gui.add(settings, 'countPerDot', 1, 10000).step(1).onFinishChange(() => {
    points = generatePoints(settings, precincts)
    onChangeVoterPlot()
    onChangeDistricts()
  })
  gui.add(settings, 'alpha', 0, 100).onFinishChange(onChangeVoterPlot)
  // gui.add(settings, 'calculationSampleRate', 0, 100).step(1).onFinishChange(onChangeDistricts)
  // gui.add(settings, 'scale', 8000, 30000).onFinishChange(onChange)
  // gui.add(settings, 'translateX', -1000, 2000).onFinishChange(onChange)
  // gui.add(settings, 'translateY', -1000, 2000).onFinishChange(onChange)
  gui.add(settings, 'democrat').onFinishChange(onChangeVoterPlot)
  gui.add(settings, 'republican').onFinishChange(onChangeVoterPlot)
  gui.add(settings, 'libertarian').onFinishChange(onChangeVoterPlot)
  gui.add(settings, 'unaffiliated').onFinishChange(onChangeVoterPlot)
  gui.add({ toggleDistrict }, 'toggleDistrict')
}
