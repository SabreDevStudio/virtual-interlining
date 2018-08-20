const csv = require('fast-csv')
const fs = require('fs')
const logCurrentFlightData = require('./log.service')
const findCheapestConnection = require('./cheapestConnection.service')

const processVirtualInterlinig = async function (flightList, BFMresource, DSSresource, DSS, BFM) {
  const csvStream = csv.createWriteStream({headers: true})
  const writableStream = fs.createWriteStream(`./logs/${new Date().getTime()}_log.csv`)
  csvStream.pipe(writableStream);

  for (const flightInitQuery of flightList) {
    let currentFlight = {flightInitQuery: flightInitQuery}
    console.log(`${currentFlight.flightInitQuery.DEPdateTimeLeg1} 
    ${currentFlight.flightInitQuery.DEPLocation} => ${currentFlight.flightInitQuery.ARRLocation}`)

    await BFMresource.getBFM(currentFlight.flightInitQuery)
    .then(BFMresponse => {
      BFM.handleBFMresponse(currentFlight, BFMresponse)
      console.log('BFM response: ', BFMresponse.statusCode);
      return DSSresource.getTransferAirport(currentFlight.flightInitQuery.DEPLocation, 
        currentFlight.flightInitQuery.ARRLocation, 
        currentFlight.flightInitQuery.DEPdateTimeLeg1)
    })
    .then(DSSdata => {
      currentFlight.directions = DSS.getSortedDSSbyDirection(DSS.getMmlList(DSS.getMmpList(DSSdata)))
      console.log('DSS call')
      return BFM.getBFMviaTransferPoint(BFMresource, currentFlight, 'LCCtoGDS')
    })
    .then(() => BFM.getBFMviaTransferPoint(BFMresource, currentFlight, 'GDStoLCC'))
    .then(() => findCheapestConnection(currentFlight, 'LCCtoGDS'))
    .then(() => findCheapestConnection(currentFlight, 'GDStoLCC'))
    .then(() => logCurrentFlightData(csvStream, currentFlight))
    .catch(err => { throw new Error(err) })
    console.log('----------------------------------------NEXT FLIGHT----------------------------------------');
  }
  csvStream.end();
  console.log('done!');
}

module.exports = processVirtualInterlinig