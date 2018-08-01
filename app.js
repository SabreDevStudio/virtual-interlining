const DSS = require('./services/DSS/dss.service')
const DSSresource = require('./services/DSS/dss.resource.service')
const BFMresource = require('./services/BFM/bfm.resource.service')
const getFlightDateList = require('./services/flightDates.service')
const csvToJsonConverter = require('./services/csvToJsonConverter.service')
const jsHelper = require('./services/jsHelper.service')
const fs = require('fs')


const getFullFlightsList = (flightPoints, flightDates) => {
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
}

async function processArray(flightList) {
  for (const flight of flightList) {
    let BFMdetails = {
      DEPLocation: flight.DEPLocation,
      ARRLocation: flight.ARRLocation,
      DEPdateTimeLeg1: flight.DEPdateTimeLeg1,
      DEPdateTimeLeg2: flight.DEPdateTimeLeg2
    }
    await BFMresource.getBFM(BFMdetails)
  }
  console.log('done!');
}

async function processArrayParalel(flightList) {
  var wstream = fs.createWriteStream(`${new Date().getTime()}_log.txt`);

  const promises = flightList.map(flight => {
    process.stdout.write(':');

    return BFMresource.getBFM({
      DEPLocation: flight.DEPLocation,
      ARRLocation: flight.ARRLocation,
      DEPdateTimeLeg1: flight.DEPdateTimeLeg1,
      DEPdateTimeLeg2: flight.DEPdateTimeLeg2
    }, wstream)
  })

  await Promise.all(promises)
  wstream.end();
  console.log('done!');
}

csvToJsonConverter().then(data => {
  //1 csv to json part
  let flightPoints = jsHelper.fromToParser(data)
  //2 get departure and arrival dates
  let flightDates = getFlightDateList()
  let allFlights = getFullFlightsList(flightPoints, flightDates)
  //3 BFMresource call
  processArrayParalel(allFlights.slice(0, 10))
  // processArrayParalel(allFlights)
}, err => {
  console.log('err: ', err);
})


//4 get DSS part: 
// DSSresource.getTransferAirport('LON', 'KRK', '2018-08-12').then(data => {
//   let mmpList = DSS.getMmpList(data)
//   console.log(DSS.getMmlList(mmpList))
// }, err => {
//   console.log('DSSresource error: ',err)
// })