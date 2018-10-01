'use strict'

const request = require('request')
const proxyUrl = require('../access')

const getBody = tripInfo => {
  return {
    "route": [
      {
        "depDate": tripInfo.depDate,
        "dstCity": tripInfo.dstCity,
        "depCity": tripInfo.depCity
      }
    ],
    "options": {
      "limit":0,
      "fareTypes": [
        "LOW"
      ],
      "currency": ["EUR"]
    }
  }
}

const ypsilonResource = {
  getItins: tripInfo => {
    return new Promise((resolve, reject) => {
      request
      .defaults({'proxy': proxyUrl})
        .post({
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Basic c2FicmU6NWZiZmMxYjQ4MTQ3OTc3OTc4ZTkwMzZjMDdhZWQ0NjY='
          },
          url: 'http://f1-gsi.infosys.de:5001/flights/',
          body: getBody(tripInfo),
          json: true
        }, (err, response) => {
          if(err) {
            console.log('Ypsilon err: ', err)
            reject(err)
          } else {
            console.log('Ypsilon: ', response.statusCode)
            response.transferCity = tripInfo.transferCity
            resolve(response)
          }
        })
    })
  }
}

module.exports = ypsilonResource