const DSS = require('./services/DSS/dss.service')
const DSSresource = require('./services/DSS/dss.resource.service')
const getOneWayFlightDateList = require('./services/flightDates.service').getOneWayFlightDateList
const csvToJsonConverter = require('./services/csvToJsonConverter.service')
const jsHelper = require('./services/jsHelper.service')
const BFMresource = require('./services/BFM/bfm.resource.service')
const BFM = require('./services/BFM/bfm.service')
const processVirtualInterlinig = require('./services/virtualInterlining.service')

csvToJsonConverter('GB').then(data => {
  let departureAndArrivalList = jsHelper.parseDepartureAndArrivalList(data.list)
  let flightDates = getOneWayFlightDateList()
  let allFlights = jsHelper.getFullFlightsList(departureAndArrivalList, flightDates)
  .slice(0, 50)
  console.log('allFlights length: ', allFlights.length)

  processVirtualInterlinig(allFlights, BFMresource, DSSresource, DSS, BFM, data.market)
}, err => {
  throw new Error(err)
})