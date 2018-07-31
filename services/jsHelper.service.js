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
  },

  fromToParser: list => {
    return list.map(el => {
      return {
        DEP: el.split('-')[0],
        ARR: el.split('-')[1]
      }
    })
  },

  getFilteredDate: d => {
    //"2018-08-13T00:00:00"
    let year = d.getFullYear()
    let month = (d.getMonth() + '').length === 1 ? `0${d.getMonth()}` : d.getMonth()
    let date = (d.getDate() + '').length === 1 ? `0${d.getDate()}` : d.getDate()
    let hours = (d.getHours() + '').length === 1 ? `0${d.getHours()}` : d.getHours()
    let minutes = (d.getMinutes() + '').length === 1 ? `0${d.getMinutes()}` : d.getMinutes()
    let seconds = (d.getSeconds() + '').length === 1 ? `0${d.getSeconds()}` : d.getSeconds()
    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`
  }
}

module.exports = jsHelper