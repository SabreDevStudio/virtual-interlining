'use strict'

const request = require('request');
const proxyUrl = 'http://sg0301761:blinD*s*abre__29@www-ad-proxy.sabre.com:80/'
const getBFMbody = require('./bfm.body.service')

const BFMResource = {
  getBFM: BFMdetails => {
    return new Promise((resolve, reject) => {
      request
      // .defaults({'proxy': proxyUrl})
      .post({
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        url: 'https://sabreapibridge.crt.aws.sabrenow.com/sabreapibridge/api/v4.1.0/shop/flights?mode=live',
        body: getBFMbody(BFMdetails),
        json: true
      }, function(err, response, body){
        if(err) reject(err)
        console.log(`[${BFMdetails.DEPLocation}->${BFMdetails.ARRLocation}] [${BFMdetails.DEPdateTimeLeg1}-${BFMdetails.DEPdateTimeLeg2}]`);
        console.log(body.errorCode ? 'err' : 'success')
        console.log('-------------');
        resolve(body)
      })
    })
  }
}

module.exports = BFMResource