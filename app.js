const DSS = require('./services/DSS/dss.service')
const BFMresource = require('./services/BFM/bfm.resource.service')
const getFlightDateList = require('./services/flightDates.service')
const csvToJsonConverter = require('./services/csvToJsonConverter.service')

// function resolveAfter2Seconds(x) {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve(x);
//     }, 2000);
//   });
// }

// async function add1(x) {
//   const a = await resolveAfter2Seconds(20);
//   const b = await resolveAfter2Seconds(30);
//   return x + a + b;
// }

// add1(10).then(v => {
//   console.log(v);  // prints 60 after 4 seconds.
// });

//1 csv to json part
csvToJsonConverter().then(data => {
  console.log(data);
  //2 get departure and arrival dates
  console.log(getFlightDateList())
}, err => {
  console.log('err: ', err);
})


//3 BFMresource call example
// BFMresource.getBFM((err, data) => {
//   if (err) throw new Error(err)
//   console.log('data: ', data);
// })


//4 get DSS part: 
// DSS.getTransferAirportList((err, list) => {
//   console.log('err: ', err)
//   console.log('list: ', list)
// })

//5 BFMresource call example



