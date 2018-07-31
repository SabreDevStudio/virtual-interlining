const DSS = require('./services/DSS/dss.service')
const BFMresource = require('./services/BFM/bfm.resource.service')
const DSSresource = require('./services/DSS/dss.resource.service')
const getFlightDateList = require('./services/flightDates.service')
const csvToJsonConverter = require('./services/csvToJsonConverter.service')
const jsHelper = require('./services/jsHelper.service')

async function processArray(array) {
  for (const item of array) {
    let BFMdetails = {
      DEPLocation: 'FRA',
      ARRLocation: 'KRK',
      DEPdateTimeLeg1: item.DEP,
      DEPdateTimeLeg2: item.ARR
    }
    await BFMresource.getBFM(BFMdetails)
  }
  console.log('done!');
}

async function processArrayParalel(flightList) {
  const promises = flightList.map(flight => {
    
    return BFMresource.getBFM({
      DEPLocation: flight.DEPLocation,
      ARRLocation: flight.ARRLocation,
      DEPdateTimeLeg1: flight.DEPdateTimeLeg1,
      DEPdateTimeLeg2: flight.DEPdateTimeLeg2
    })
  })

  await Promise.all(promises)
  console.log('done!');
}

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

csvToJsonConverter().then(data => {
  //1 csv to json part
  let flightPoints = jsHelper.fromToParser(data)
  //2 get departure and arrival dates
  let flightDates = getFlightDateList()
  let allFlights = getFullFlightsList(flightPoints, flightDates)
  //3 BFMresource call
  // console.log('allFlights 1', allFlights[1]);
  // console.log('allFlights 423', allFlights[423]);
  // console.log('allFlights 424', allFlights[424]);
  // console.log('allFlights 425', allFlights[425]);
  processArrayParalel(allFlights.slice(0, 35))

}, err => {
  console.log('err: ', err);
})


//4 get DSS part: 
// DSS.getTransferAirportList((err, list) => {
//   console.log('err: ', err)
//   console.log('list: ', list)
// })

// DSSresource.getTransferAirport('LON', 'KRK', '2018-08-12', (err, data) => {
//   if (!err) {
//     // console.log('data: ', data);
//     // let mmpList = DSS.getMmpList(data)
//     // console.log(DSS.getMmlList(mmpList))
//   }
// })

//5 BFMresource call example



