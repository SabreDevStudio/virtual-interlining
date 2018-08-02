'use strict'
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
    return Object.keys(obj).reduce(function(acc, k) {
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

  logIt: (wstream, BFMdetails, BFMresponse, leg1DSSData, leg2DSSdata) => {
    console.log('PricedItinCount: ', BFMresponse.body.OTA_AirLowFareSearchRS.PricedItinCount);
    console.log(BFMdetails);
    console.log('leg1DSSData: ', leg1DSSData);
    console.log('leg2DSSdata: ', leg2DSSdata);
    process.stdout.write('................................');
    
    // wstream.write(`[${BFMdetails.DEPLocation} -> ${BFMdetails.ARRLocation}]\
    // [${jsHelper.getFilteredDate(BFMdetails.DEPdateTimeLeg1)} -> ${jsHelper.getFilteredDate(BFMdetails.DEPdateTimeLeg2)}]\
    // [${response.statusCode}]\n`)
  },

  fromToParser: list => {
    return list.map(el => {
      return {
        DEP: el.split('-')[0],
        ARR: el.split('-')[1]
      }
    })
  },

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

  processArray: async function (flightList, promisedFunction) {
    for (const flight of flightList) {
      let BFMdetails = {
        DEPLocation: flight.DEPLocation,
        ARRLocation: flight.ARRLocation,
        DEPdateTimeLeg1: flight.DEPdateTimeLeg1,
        DEPdateTimeLeg2: flight.DEPdateTimeLeg2
      }
      await promisedFunction(BFMdetails)
    }
    console.log('done!');
  },

  getBFMdetails: flight => {
    return {
      DEPLocation: flight.DEPLocation,
      ARRLocation: flight.ARRLocation,
      DEPdateTimeLeg1: jsHelper.getFilteredDate(flight.DEPdateTimeLeg1),
      DEPdateTimeLeg2: jsHelper.getFilteredDate(flight.DEPdateTimeLeg2)
    }
  },
  
  processArrayParalel: async function (flightList, BFMresource, DSSresource, DSS) {
    const wstream = fs.createWriteStream(`${new Date().getTime()}_log.txt`);
    let BFMresponseData, leg1DSSData, leg2DSSdata;

    const flightListPromises = flightList.map(flight => {
      process.stdout.write(':');
      let BFMdetails = jsHelper.getBFMdetails(flight)

      return BFMresource.getBFM(BFMdetails)
      .then(BFMresponse => {
        BFMresponseData = BFMresponse
        return DSSresource.getTransferAirport(BFMdetails.DEPLocation, BFMdetails.ARRLocation, BFMdetails.DEPdateTimeLeg1)
      }).then(DSSdataLeg1 => {
        leg1DSSData = DSS.getMmlList(DSS.getMmpList(DSSdataLeg1))
        leg1DSSlccData = []
        leg1DSSgdsData = []
        return DSSresource.getTransferAirport(BFMdetails.ARRLocation, BFMdetails.DEPLocation, BFMdetails.DEPdateTimeLeg2)
      }).then(DSSdataLeg2 => {
        leg2DSSdata = DSS.getMmlList(DSS.getMmpList(DSSdataLeg2))
        leg2DSSlccData = []
        leg2DSSgdsData = []
        jsHelper.logIt(wstream, BFMdetails, BFMresponseData, leg1DSSData, leg2DSSdata)
      })
      //split DSS by GDS-LCC and LCC-GDS
      //time to call BFM with DSSdata1 for leg1
      //time to call BFM with DSSdata2 for leg2
    })

    await Promise.all(flightListPromises)
    wstream.end();
    console.log('done!');
  }
}

module.exports = jsHelper