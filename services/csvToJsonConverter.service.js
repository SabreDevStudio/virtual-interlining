'use strict'

const csv = require('csvtojson')

module.exports = () => new Promise((resolve, reject) => {
  csv({noheader: true, output: "line"})
    .on('error', err => reject(err))
    .fromFile('./csv/GB.csv')
    .then(jsonObj => resolve(jsonObj))
})