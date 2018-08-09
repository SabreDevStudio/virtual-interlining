'use strict'

const request = require('request');
const proxyUrl = 'http://sg0301761:blinD*s*abre__29@www-ad-proxy.sabre.com:80/'
const BFM = require('./bfm.service')
const jsHelper = require('../jsHelper.service')

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
          if (err) resolve()
          jsHelper.logToStdout('bfm ')
          if (response && response.body && !response.body.errorCode) {
            resolve(response)
          }
        })
    })
  }
}

module.exports = BFMResource