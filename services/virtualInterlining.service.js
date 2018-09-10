const csv = require('fast-csv')
const fs = require('fs')
const logCurrentFlightData = require('./log.service')
const findCheapestConnection = require('./cheapestConnection.service')
const BFMresource = require('./BFM/bfm.resource.service')
const DSSresource = require('./DSS/dss.resource.service')
const DSS = require('./DSS/dss.service')
const BFM = require('./BFM/bfm.service')

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
    .then(BFMresponse => {
      BFM.handleBFMresponse(currentFlight, BFMresponse)
      return DSSresource.getTransferAirport(currentFlight.flightInitQuery.DEPLocation,
                                            currentFlight.flightInitQuery.ARRLocation,
                                            currentFlight.flightInitQuery.DEPdateTimeLeg1, market)
    })
    .then(DSSdata => {
      if (market === 'RU') {
        console.log(DSS.getParcedDssRuTransferPoints(DSSdata));
      } else {
        currentFlight.directions = DSS.getParcedDssTransferPoints(DSSdata)
        // currentFlight.directions = DSS.getParcedDssTransferPoints(DSS.getMmlList(DSSdata))
      }
      console.log('DSS call')
      return BFM.getBFMviaTransferPoint(currentFlight, 'LCCtoGDS')
    })
    .then(() => BFM.getBFMviaTransferPoint(currentFlight, 'GDStoLCC'))
    .then(() => findCheapestConnection(currentFlight, 'LCCtoGDS'))
    .then(() => findCheapestConnection(currentFlight, 'GDStoLCC'))
    .then(() => {
      VIresult.push(currentFlight)
      logCurrentFlightData(csvStream, currentFlight)
    })
    .catch(err => { throw new Error(err) })
    console.log('----------------------------------------NEXT FLIGHT----------------------------------------')
  }

  cb(VIresult)
  csvStream.end()
  console.log('done!')
}

module.exports = processVirtualInterlinigLoop