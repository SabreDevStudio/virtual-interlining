const csv = require('fast-csv')
const fs = require('fs')
const logCurrentFlightData = require('./log.service')
const cheapestConnection = require('./cheapestConnection.service')
const BFMresource = require('./BFM/bfm.resource.service')
const DSSresource = require('./DSS/dss.resource.service')
const BFM = require('./BFM/bfm.service')
const itineraryViaTransferPoint = require('./itineraryViaTransferPoint.service')

const processVirtualInterlinigLoop = async function (oAndDwithDatesList, market, cb) {
  let VIresult = []
  const csvStream = csv.createWriteStream({headers: true})
  const writableStream = fs.createWriteStream(`./logs/${market}_${new Date().getTime()}_log.csv`)
  csvStream.pipe(writableStream)

  for (const flightInitQuery of oAndDwithDatesList) {
    let currentFlight = {flightInitQuery: flightInitQuery, market: market}
    console.log(`${currentFlight.flightInitQuery.DEPdateTimeLeg1} 
    ${currentFlight.flightInitQuery.DEPLocation} => ${currentFlight.flightInitQuery.ARRLocation}`)

    await BFMresource.getBFM(currentFlight.flightInitQuery)
    .then(BFMresponse => BFM.handleBFMresponse(currentFlight, BFMresponse))
    .then(() => DSSresource.getTransferAirport(currentFlight))
    .then(DSSdata => itineraryViaTransferPoint.get(currentFlight, DSSdata))
    .then(() => cheapestConnection.find(currentFlight))
    .then(() => logCurrentFlightData(csvStream, currentFlight))
    .then(() => VIresult.push(currentFlight))
    // .catch(err => { throw new Error(err) })
    console.log('----------------------------------------NEXT INTERLINING----------------------------------------')
  }

  cb(VIresult)
  csvStream.end()
  console.log('done!')
}

module.exports = processVirtualInterlinigLoop