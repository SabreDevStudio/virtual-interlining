'use strict'

const request = require('request');
const proxyUrl = 'http://sg0301761:blinD*s*abre__29@www-ad-proxy.sabre.com:80/'
const getBFMbody = require('./bfm.body.service')

const BFMResource = {
  getBFM: BFMdetails => {
    return new Promise(resolve => {
      request
        .defaults({'proxy': proxyUrl})
        .post({
          headers: {'Content-Type': 'application/json;charset=UTF-8'},
          url: 'https://sabreapibridge.crt.aws.sabrenow.com/sabreapibridge/api/v4.1.0/shop/flights?mode=live',
          body: getBFMbody(BFMdetails),
          json: true
        }, function(err, response) {
          if (response.body && !response.body.errorCode) {
          process.stdout.write('1');
            resolve(new Promise(resolve => resolve(response)))
          } else {
            process.stdout.write('0');
          }
        })
    })
  }
}

module.exports = BFMResource