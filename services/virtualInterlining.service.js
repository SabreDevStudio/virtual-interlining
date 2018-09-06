const csv = require('fast-csv')
const fs = require('fs')
const logCurrentFlightData = require('./log.service')
const findCheapestConnection = require('./cheapestConnection.service')

const processVirtualInterlinigLoop = async function (flightList, BFMresource, DSSresource, DSS, BFM, market, ypsilonResource, itinParser, cb) {
  let VIresult = []
  const csvStream = csv.createWriteStream({headers: true})
  const writableStream = fs.createWriteStream(`./logs/${market}_${new Date().getTime()}_log.csv`)
  csvStream.pipe(writableStream)

  for (const flightInitQuery of flightList) {
    let currentFlight = {flightInitQuery: flightInitQuery, market: market}
    console.log(`${currentFlight.flightInitQuery.DEPdateTimeLeg1} 
    ${currentFlight.flightInitQuery.DEPLocation} => ${currentFlight.flightInitQuery.ARRLocation}`)

    await BFMresource.getBFM(currentFlight.flightInitQuery)
    .then(BFMresponse => {
      BFM.handleBFMresponse(currentFlight, BFMresponse)
      return DSSresource.getTransferAirport(currentFlight.flightInitQuery.DEPLocation, 
        currentFlight.flightInitQuery.ARRLocation, 
        currentFlight.flightInitQuery.DEPdateTimeLeg1)
    })
    .then(DSSdata => {
      currentFlight.directions = DSS.getSortedDSSbyDirection(DSS.getMmlList(DSSdata))
      console.log('DSS call')
      return BFM.getBFMviaTransferPoint(BFMresource, ypsilonResource, itinParser, currentFlight, 'LCCtoGDS')
    })
    .then(() => BFM.getBFMviaTransferPoint(BFMresource, ypsilonResource, itinParser, currentFlight, 'GDStoLCC'))
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