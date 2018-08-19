// const map = require('async/map')
const DSS = require('./services/DSS/dss.service')
const DSSresource = require('./services/DSS/dss.resource.service')
const getOneWayFlightDateList = require('./services/flightDates.service').getOneWayFlightDateList
const csvToJsonConverter = require('./services/csvToJsonConverter.service')
const jsHelper = require('./services/jsHelper.service')
const BFMresource = require('./services/BFM/bfm.resource.service')
const BFM = require('./services/BFM/bfm.service')

csvToJsonConverter().then(data => {
  let departureAndArrivalList = jsHelper.parseDepartureAndArrivalList(data)//csv to json
  let flightDates = getOneWayFlightDateList()//get departure and arrival dates
  let allFlights = jsHelper.getFullFlightsList(departureAndArrivalList, flightDates).slice(0, 500)
  console.log('allFlights length: ', allFlights.length)

  // jsHelper.processArrayParalel(allFlights, BFMresource, DSSresource, DSS, BFM)
  jsHelper.processArray(allFlights, BFMresource, DSSresource, DSS, BFM)
}, err => {
  throw new Error(err)
})