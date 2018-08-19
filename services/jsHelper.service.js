'use strict'
var csv = require('fast-csv')
const fs = require('fs')

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
    let month = (d.getMonth() + '').length === 1 ? `0${d.getMonth()}` : d.getMonth()
    let date = (d.getDate() + '').length === 1 ? `0${d.getDate()}` : d.getDate()
    let hours = (d.getHours() + '').length === 1 ? `0${d.getHours()}` : d.getHours()
    let minutes = (d.getMinutes() + '').length === 1 ? `0${d.getMinutes()}` : d.getMinutes()
    let seconds = (d.getSeconds() + '').length === 1 ? `0${d.getSeconds()}` : d.getSeconds()
    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`
  },

  getFullFlightsList: (flightPoints, flightDates) => {
    let fullList = []
  
    flightPoints.forEach(points => {
      flightDates.forEach(dates => {
        fullList.push({
          DEPLocation: points.DEP,
          ARRLocation: points.ARR,
          DEPdateTimeLeg1: dates.DEP,
          DEPdateTimeLeg2: dates.ARR
        })
      })
    });
  
    return fullList
  },

  handleBFMresponse: (currentFlight, BFMresponse) => {
    if (BFMresponse && BFMresponse.statusCode === 200) {
      currentFlight.GDS = Math.min(...BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary
        .map(el => el.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount))
    } else {
      currentFlight.GDS = 'no data'
    }
  },

  processArray: async function (flightList, BFMresource, DSSresource, DSS, BFM) {
    const csvStream = csv.createWriteStream({headers: true})
    const writableStream = fs.createWriteStream(`./logs/${new Date().getTime()}_log.csv`)
    csvStream.pipe(writableStream);

    for (const flightInitQuery of flightList) {
      let currentFlight = jsHelper.flightSchema()
      currentFlight.flightInitQuery = flightInitQuery
      let BFMdetails = jsHelper.getBFMdetails(flightInitQuery)

      await BFMresource.getBFM(BFMdetails)
      .then(BFMresponse => {
        jsHelper.handleBFMresponse(currentFlight, BFMresponse)
        return DSSresource.getTransferAirport(BFMdetails.DEPLocation, BFMdetails.ARRLocation, BFMdetails.DEPdateTimeLeg1)
      })
      .then(DSSdata => {
        currentFlight.directions = jsHelper.getSortedDSSbyDirection(DSS.getMmlList(DSS.getMmpList(DSSdata)))
        console.log('currentFlight: ', currentFlight);
        
        return BFM.getBFMviaTransferPoint(BFMresource, currentFlight, 'LCCtoGDS')
      })
      .then(() => BFM.getBFMviaTransferPoint(BFMresource, currentFlight, 'GDStoLCC'))
      .then(() => jsHelper.findCheapestConnection(currentFlight, 'LCCtoGDS'))
      .then(() => jsHelper.findCheapestConnection(currentFlight, 'GDStoLCC'))
      .then(() => jsHelper.logCurrentFlightData(csvStream, currentFlight))
      .catch(err => { throw new Error(err) })
      console.log('----------------------------------------NEXT FLIGHT----------------------------------------');
    }
    csvStream.end();
    console.log('done!');
  },

  logCurrentFlightData: (csvStream, currentFlight) => {
    let LCCtoGDSdirectionsResult =  currentFlight.directions.LCCtoGDS.result
    let GDStoLCCdirectionsResult =  currentFlight.directions.GDStoLCC.result
    let LCCtoGDSitinAprice = LCCtoGDSdirectionsResult && LCCtoGDSdirectionsResult.itinAprice ? LCCtoGDSdirectionsResult.itinAprice : 'no data'
    let LCCtoGDSitinBprice = LCCtoGDSdirectionsResult && LCCtoGDSdirectionsResult.itinBprice ? LCCtoGDSdirectionsResult.itinBprice : 'no data'
    let GDStoLCCitinAprice = GDStoLCCdirectionsResult && GDStoLCCdirectionsResult.itinAprice ? GDStoLCCdirectionsResult.itinAprice : 'no data'
    let GDStoLCCitinBprice = GDStoLCCdirectionsResult && GDStoLCCdirectionsResult.itinBprice ? GDStoLCCdirectionsResult.itinBprice : 'no data'

    csvStream.write({
      DEP: currentFlight.flightInitQuery.DEPLocation,
      ARR: currentFlight.flightInitQuery.ARRLocation,
      DEPtime: jsHelper.getFilteredDate(currentFlight.flightInitQuery.DEPdateTimeLeg1),
      BFM_status: currentFlight.GDS,
      LCCtoGDS: `${LCCtoGDSitinAprice} + ${LCCtoGDSitinBprice}`,
      GDStoLCC: `${GDStoLCCitinAprice} + ${GDStoLCCitinBprice}`
    });
  },

  findCheapestConnection: (currentFlight, direction) => {
    console.log('direction----->: ', direction);
    
    return new Promise(resolve => {
      //1 sort by price
      jsHelper.sortItineraryListByPrice(currentFlight, direction, 'chunk1list')
      jsHelper.sortItineraryListByPrice(currentFlight, direction, 'chunk2list')
      //2 find cheapest connection
      jsHelper.findConnection(currentFlight, direction, () => {resolve()})
    })
  },

  findConnection: (currentFlight, direction, cb) => {
    if (currentFlight.directions[direction].chunk1list.length &&
        currentFlight.directions[direction].chunk2list.length) {

      currentFlight.directions[direction].chunk1list.every(itinA => {
        return currentFlight.directions[direction].chunk2list.every(itinB => {
          let itinAFlightSegment = itinA.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment
          let itinBFlightSegment = itinB.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment
          process.stdout.write('.')

          if(jsHelper.isDatesHaveTwoHoursForTransfer(itinAFlightSegment[itinAFlightSegment.length - 1].ArrivalDateTime,
            itinBFlightSegment[0].DepartureDateTime)) {

              currentFlight.directions[direction].result = {
                itinAprice: itinA.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount,
                itinBprice: itinB.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount
              }
              cb(null)
              console.log('FOUND: ',itinAFlightSegment[itinAFlightSegment.length - 1].ArrivalDateTime + ' ' + itinBFlightSegment[0].DepartureDateTime);
              console.log('currentFlight: ', currentFlight)
              return false
          } else {
            cb(true)
            return true
          }
        })
      })
    } else {
      console.log('not anought data to find connection')
      cb(true)
    }
  },

  getMiliseconds: hour => 1000 * 60 * 60 * hour,
  isDatesHaveTwoHoursForTransfer: (date1, date2) => 
    new Date(date2).getTime() - new Date(date1).getTime() > jsHelper.getMiliseconds(2) &&
    new Date(date2).getTime() - new Date(date1).getTime() < jsHelper.getMiliseconds(3),

  sortItineraryListByPrice: (currentFlight, direction, chunk) => {
    if (currentFlight.directions[direction][chunk].length) {
      currentFlight.directions[direction][chunk].sort((a, b) =>
      a.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount -
      b.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount)
    }
  },

  getBFMdetails: flight => {
    return {
      DEPLocation: flight.DEPLocation,
      ARRLocation: flight.ARRLocation,
      DEPdateTimeLeg1: flight.DEPdateTimeLeg1 ? jsHelper.getFilteredDate(flight.DEPdateTimeLeg1) : null,
      DEPdateTimeLeg2: flight.DEPdateTimeLeg2 ? jsHelper.getFilteredDate(flight.DEPdateTimeLeg2) : null
    }
  },

  flightSchema: () => new Object({
    GDS: {},
    directions: {}
  }),

  getSortedDSSbyDirection: DSSlist => {
    let sortedDSSlist = {
      GDStoLCC:{source:[], chunk1list:[], chunk2list:[]},
      LCCtoGDS:{source:[], chunk1list:[], chunk2list:[]}
    }
    DSSlist.forEach(el => {
      if (el['1'].TCR === 'true' && el['2'].LCC === 'true') {
        sortedDSSlist.GDStoLCC.source.push(el)
      }
      if (el['1'].LCC === 'true' && el['2'].TCR === 'true') {
        sortedDSSlist.LCCtoGDS.source.push(el)
      }
    })
    return sortedDSSlist
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