'use strict'

const csv = require('csvtojson')

let marketList = {
  GB: './csv/GB.csv',
  DK: './csv/DK.csv',
  NO: './csv/NO.csv',
  SE: './csv/SE.csv',
  ES: './csv/ES.csv',
  ES1: './csv/ES.1.csv',
  ES2: './csv/ES.2.csv',
  ES3: './csv/ES.3.csv',
  FR: './csv/FR.csv'
}



const getMarketDirections = () => new Promise((resolve, reject) => {
  let market = process.env.NODE_ENV || 'GB'

  csv({noheader: true, output: "line"})
    .on('error', err => reject(err))
    .fromFile(marketList[market])
    .then(jsonObj => resolve({market: market, list: jsonObj}))
})

module.exports = getMarketDirections