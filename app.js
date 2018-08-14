// const map = require('async/map')
const DSS = require('./services/DSS/dss.service')
const DSSresource = require('./services/DSS/dss.resource.service')
const getFlightDateList = require('./services/flightDates.service')
const csvToJsonConverter = require('./services/csvToJsonConverter.service')
const jsHelper = require('./services/jsHelper.service')
const BFMresource = require('./services/BFM/bfm.resource.service')
const BFM = require('./services/BFM/bfm.service')

csvToJsonConverter().then(data => {
  let flightPoints = jsHelper.fromToParser(data)//csv to json
  let flightDates = getFlightDateList()//get departure and arrival dates
  let allFlights = jsHelper.getFullFlightsList(flightPoints, flightDates).slice(60, 500)
  console.log('allFlights length: ', allFlights.length)

  

  // jsHelper.processArrayParalel(allFlights, BFMresource, DSSresource, DSS, BFM)
  jsHelper.processArray(allFlights, BFMresource, DSSresource, DSS, BFM)
}, err => {
  console.log('csv To Json Converter err: ', err);
})