'use strict'

const fs = require('fs');

const jsHelper = {
  toOneLineString: structure => {
    let oneLineString = '';
    for (let key in structure) {
      oneLineString = oneLineString.concat(key + '=' + structure[key] + '&')
    }
    return oneLineString
  },

  deepMap: (obj, f) => {
    return Object.keys(obj).reduce(function(acc, k) {
      if ({}.toString.call(obj[k]) == '[object Object]') {
        acc[k] = jsHelper.deepMap(obj[k], f)
      } else {
        acc[k] = f(obj[k], k)
      }
      return acc
    },{})
  },

  joinObjects: arrObj => {
    let counter = 0
    return arrObj.reduce((acc, x, index) => {
      if((index) % 6 === 0) {
        counter++
        acc[counter] = {}
      }
  
      for (var key in x) acc[counter][key] = x[key]
      return acc
    }, {})
  },

  logIt: data => {
    fs.writeFile('log.json', JSON.stringify(data), 'utf8', () => {});
  }
}

module.exports = jsHelper