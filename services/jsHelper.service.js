'use strict'

const jsHelper = {
  toOneLineString: structure => {
    let oneLineString = '';
    for (let key in structure) {
      oneLineString = oneLineString.concat(key + '=' + structure[key] + '&')
    }
    return oneLineString
  },

  deepMap: (obj, f) => {
    return Object.keys(obj).reduce((acc, k) => {
      if ({}.toString.call(obj[k]) == '[object Object]') {
        acc[k] = jsHelper.deepMap(obj[k], f)
      } else {
        acc[k] = f(obj[k], k)
      }
      return acc
    },{})
  },

  joinObjects: arrObj => {
    let counter = 0
    return arrObj.reduce((acc, x, index) => {
      if((index) % 6 === 0) {
        counter++
        acc[counter] = {}
      }
  
      for (var key in x) acc[counter][key] = x[key]
      return acc
    }, {})
  },

  parseDepartureAndArrivalList: list => list.map(el => {
      return {
        DEP: el.split('-')[0],
        ARR: el.split('-')[1]
      }
    })
  ,

  getFilteredDate: d => {
    //here is schema: "2018-08-13T00:00:00"
    let year = d.getFullYear()
    let month = (d.getMonth() + '').length === 1 && d.getMonth() !== 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1
    let date = (d.getDate() + '').length === 1 ? `0${d.getDate()}` : d.getDate()
    return `${year}-${month}-${date}T00:00:00`
  },

  getFullFlightsList: (flightPoints, flightDates) => {
    let fullList = []
  
    flightPoints.forEach(points => {
      flightDates.forEach(dates => {
        fullList.push({
          DEPLocation: points.DEP,
          ARRLocation: points.ARR,
          DEPdateTimeLeg1: dates.DEP ? jsHelper.getFilteredDate(dates.DEP) : null,
          DEPdateTimeLeg2: dates.ARR ? jsHelper.getFilteredDate(dates.ARR) : null
        })
      })
    });
  
    return fullList
  },

  filterLegView: leg => `${leg['1'].OCT} - ${leg['1'].DCT} - ${leg['2'].OCT} - ${leg['2'].DCT}`,
  filterLegViewReversed: leg => `${leg['2'].DCT} - ${leg['2'].OCT} - ${leg['1'].DCT} - ${leg['1'].OCT}`,

  findRoundTripItins: (currentFlight, direction) => {
    if (currentFlight[direction].leg1.length && currentFlight[direction].leg2.length) {
      currentFlight[direction].leg1.forEach(leg1el => {
        currentFlight[direction].leg2.forEach(leg2el => {
          if (jsHelper.filterLegView(leg1el) === jsHelper.filterLegViewReversed(leg2el)) {
            currentFlight[direction].roundTripList.push(leg1el)
          }
        })
      })
    }
  }
}

module.exports = jsHelper