'use strict'

const request = require('request');
const proxyUrl = 'http://sg0301761:blinD*s*abre__29@www-ad-proxy.sabre.com:80/'
const BFMbody = require('./bfm.body.service')

const BFMResource = {
  getBFM: cb => {
    request
      .defaults({'proxy': proxyUrl})
      .post({
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        url: 'https://sabreapibridge.crt.aws.sabrenow.com/sabreapibridge/api/v4.1.0/shop/flights?mode=live',
        body: BFMbody,
        json: true
      }, function(err, response, body){
        if(err) cb(err)
        cb(null, body)
      })
  }
}

module.exports = BFMResource