'use strict'

const csv = require('csvtojson')

let marketList = {
  GB: './csv/GB.csv',
  DK: './csv/DK.csv',
  NO: './csv/NO.csv',
  SE: './csv/SE.csv'
}

const getMarketDirections = market => new Promise((resolve, reject) => {
  csv({noheader: true, output: "line"})
    .on('error', err => reject(err))
    .fromFile(marketList[market])
    .then(jsonObj => resolve({market: market, list: jsonObj}))
})

module.exports = getMarketDirections