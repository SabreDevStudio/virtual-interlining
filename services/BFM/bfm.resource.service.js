'use strict'

const request = require('request');
const proxyUrl = require('../access')
const BFM = require('./bfm.service')

const BFMResource = {
  getBFM: BFMdetails => {
    return new Promise((resolve, reject) => {
      request
        .defaults({'proxy': proxyUrl})
        .post({
          headers: {'Content-Type': 'application/json;charset=UTF-8'},
          url: 'https://sabreapibridge.crt.aws.sabrenow.com/sabreapibridge/api/v4.1.0/shop/flights?mode=live',
          body: BFM.getBFMbody(BFMdetails),
          json: true
        }, (err, response) => {
          resolve(response)
        })
    })
  }
}

module.exports = BFMResource