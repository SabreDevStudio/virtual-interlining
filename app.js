const DSS = require('./services/DSS/dss.service')
const BFMresource = require('./services/BFM/bfm.resource.service')
const getFlightDateList = require('./services/flightDates.service')
const csvToJsonConverter = require('./services/csvToJsonConverter.service')

//get DSS part: 
// DSS.getTransferAirportList((err, list) => {
//   console.log('err: ', err)
//   console.log('list: ', list)
// })

//csv to json part
// csvToJsonConverter((json) => {
//   console.log(json)
// })

//get departure and arrival dates
// console.log(getFlightDateList())

// BFMresource call example
BFMresource.getBFM((err, data) => {
    if (err) throw new Error(err)
    console.log('data: ', data);
})
