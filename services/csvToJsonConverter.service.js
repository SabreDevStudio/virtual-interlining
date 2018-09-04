'use strict'

const csv = require('csvtojson')

let marketList = {
  GB: './csv/GB.csv',
  DK: './csv/DK.csv',
  NO: './csv/NO.csv',
  SE: './csv/SE.csv',
  ES: './csv/ES.csv',
  FR: './csv/FR.csv',
  US: './csv/US.csv',
  RU: './csv/RU.csv'
}



const getMarketDirections = () => new Promise((resolve, reject) => {
  let market = process.env.NODE_ENV || 'GB'

  csv({noheader: true, output: "line"})
    .on('error', err => reject(err))
    .fromFile(marketList[market])
    .then(jsonObj => resolve({market: market, list: jsonObj}))
})

module.exports = getMarketDirections