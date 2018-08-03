const DSS = require('./services/DSS/dss.service')
const DSSresource = require('./services/DSS/dss.resource.service')
const getFlightDateList = require('./services/flightDates.service')
const csvToJsonConverter = require('./services/csvToJsonConverter.service')
const jsHelper = require('./services/jsHelper.service')
const BFMresource = require('./services/BFM/bfm.resource.service')


csvToJsonConverter().then(data => {
  //1 csv to json part
  let flightPoints = jsHelper.fromToParser(data)
  //2 get departure and arrival dates
  let flightDates = getFlightDateList()
  let allFlights = jsHelper.getFullFlightsList(flightPoints, flightDates)
  //3 BFMresource call
  jsHelper.processArrayParalel(allFlights.slice(0, 100), BFMresource, DSSresource, DSS)
}, err => {
  console.log('csv To Json Converter err: ', err);
})