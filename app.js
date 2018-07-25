'use strict'

const DSS = require('./services/dss/dss.service')
const getFlightDateList = require('./services/flightDates.service')
const csvToJsonConverter = require('./services/csvToJsonConverter.service')

//get DSS part: 
DSS.getTransferAirportList((err, list) => {
  console.log('err: ', err)
  console.log('list: ', list)
})


//csv to json part
// csvToJsonConverter((json) => {
//   console.log(json)
// })

//get departure and arrival dates
// console.log(getFlightDateList())
