'use strict'

const csv = require('csvtojson')

const getJson = cb => {
  csv({
    noheader: true,
    output: "line"
  }).fromFile('./csv/NO.csv').then(jsonObj => cb(jsonObj))
}

module.exports = getJson