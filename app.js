const htmlToJsonParser = require('himalaya').parse
const RQData = require('./services/requestData.service')
const jsHelper = require('./services/jsHelper.service')
var fs = require('fs');
var easyconvert = require('easyconvert');


var deepMap = (obj, f) => {
  return Object.keys(obj).reduce(function(acc, k) {
    if ({}.toString.call(obj[k]) == '[object Object]') {
      acc[k] = deepMap(obj[k], f)
    } else {
      acc[k] = f(obj[k], k)
    }
    return acc
  },{})
}

const logIt = (data) => {
  fs.writeFile('log.json', JSON.stringify(data), 'utf8', () => {});
}

jsHelper.argumentsValidation(process.argv, (err) => {
  if (!err) {
    RQData.getTransferAirport(process.argv[2], process.argv[3], process.argv[4], (err, data) => {
      if (err) throw new Error(err)
      console.log('data====================================');
      console.log(data.length);
      let MML = easyconvert.parse(data[1].outerHTML)
      logIt(MML)
      let result = []
      deepMap(MML, (value, key) => {
        if (key === 'innerHTML' && value !== '\n' && value !== 'MML') {
          result.push(value)
        }
      })
      console.log('result: ', result.map((el, index) => {
        if (index % 2 === 0) {
          let newObj = {}
          newObj[el] = result[index += 1]
          return newObj
        }
      }).filter((el) => el ? el : null));
      

      console.log('data====================================');
    })
  }
})