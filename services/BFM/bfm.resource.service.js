'use strict'

const request = require('request');
const proxyUrl = 'http://sg0301761:blinD*s*abre__29@www-ad-proxy.sabre.com:80/'
const getBFMbody = require('./bfm.body.service')
const jsHelper = require('../jsHelper.service')
const DSSresource = require('../DSS/dss.resource.service')
const DSS = require('../DSS/dss.service')

const BFMResource = {
  getBFM: (BFMdetails, wstream) => {
    return new Promise((resolve, reject) => {
      request
      .defaults({'proxy': proxyUrl})
      .post({
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        url: 'https://sabreapibridge.crt.aws.sabrenow.com/sabreapibridge/api/v4.1.0/shop/flights?mode=live',
        body: getBFMbody(BFMdetails),
        json: true
      }, function(err, response, body){
        if(err) reject(err)

        DSSresource.getTransferAirport('LON', 'KRK', '2018-08-12').then(data => {
          let mmpList = DSS.getMmpList(data)
          let mmpListdata = DSS.getMmlList(mmpList)
          jsHelper.logIt(wstream, BFMdetails, response, mmpListdata)
          resolve(body)
        }, err => {
          console.log('DSSresource error: ',err)
        })

      })
    })
  }
}

module.exports = BFMResource