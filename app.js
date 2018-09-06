const getOneWayFlightDateList = require('./services/flightDates.service').getOneWayFlightDateList
const csvToJsonConverter = require('./services/csvToJsonConverter.service')
const jsHelper = require('./services/jsHelper.service')
const processVirtualInterlinigLoop = require('./services/virtualInterlining.service')

csvToJsonConverter().then(data => {
  let oAndDs = jsHelper.parseDepartureAndArrivalList(data.list)
  let flightDates = getOneWayFlightDateList()
  let oAndDwithDatesList = jsHelper.getFullFlightsList(oAndDs, flightDates)

  processVirtualInterlinigLoop(oAndDwithDatesList, data.market, () => {})
}, err => {
  throw new Error(err)
})