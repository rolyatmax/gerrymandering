import d3 from 'd3'
import yo from 'yo-yo'

export default function calculateRatios (settings, districts, points) {
  districts.map(d => {
    // !!!!!!!!!!!!!!!!!!!
    // NEED TO FIND KD-TREE IMPLEMENTATION THAT LETS ME STORE
    // DATA ALONGSIDE EACH POINT.
    // !!!!!!!!!!!!!!!!!!!

    // get centroid for district
    // find furthest point from centroid
    // find nearest 99999999 points within radius of centroid
    // check each to see if they fall in the polygon of the district
    // increment counters for each party
  })

  return function render () {
    settings.container.appendChild(yo`
      <div class="district-ratios">
        <h3>District Ratios</h3>
      </div>
    `)
  }
}
