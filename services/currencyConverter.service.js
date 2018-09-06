'use strict'

const conversionRatesToEuro = {
  'SEK': 10.578,
  'GBP': 0.898,
  'USD': 1.162,
  'RUB': 79.380,
  'NOK': 9.766,
  'ALL': 126.444,
  'AZN': 1.981,
  'BAM': 1.954,
  'BGN': 1.955,
  'BYN': 2.455,
  'CHF': 1.126,
  'CZK': 25.727,
  'DKK': 7.456,
  'GEL': 2.894,
  'HRK': 7.434,
  'HUF': 326.747,
  'ISK': 127.420,
  'MDL': 19.373,
  'MKD': 61.560,
  'PLN': 4.323,
  'RON': 4.638,
  'RSD': 118.295,
  'TRY': 7.659,
  'UAH': 32.902
}

const currencyConverter = {
  roundNumber: num => Math.round(num * 100) / 100,
  toEuro: (amount, currency) => {
    if (currency === 'EUR') return amount
    if (conversionRatesToEuro[currency]) {
      return amount / conversionRatesToEuro[currency]
    } else {
      console.log(`!!!!!!!!!!no requested currency like ${currency}!!!!!!!!!!!!!!!!`)
      return 0
    }
  }
}

module.exports = currencyConverter