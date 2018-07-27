const DSS = require('./services/DSS/dss.service')
const BFM = require('./services/BFM/bfm.resource.service')
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

// BFM call example
BFM.getBFM((err, data) => {
  console.log('err: ', err);
  console.log('data: ', data);
})

//https://developer.sabre.com/docs/read/rest_apis/air/search/instaflights_search

// const getToken = () => {
//   clientid = 'V1:krnnrjbso0jsk242:DEVCENTER:EXT'
// //secret = 'uY39dPAa'
//   secret = 'blinD*sabre29'
//   return btoa(btoa(clientid) + ':' + btoa(secret))
// }

// getToken()
