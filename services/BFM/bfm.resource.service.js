'use strict'

const request = require('request');
const proxyUrl = 'http://sg0301761:blinD*s*abre__29@www-ad-proxy.sabre.com:80/'

const BFMResource = {
  getBFM: cb => {
    const getBody = () => {
      return {"OTA_AirLowFareSearchRQ":{"OriginDestinationInformation":[{"DepartureDateTime":"2018-08-13T00:00:00","DestinationLocation":{"LocationCode":"NYC"},"OriginLocation":{"LocationCode":"FRA"},"RPH":"1","TPA_Extensions":{}},{"DepartureDateTime":"2018-08-27T00:00:00","DestinationLocation":{"LocationCode":"FRA"},"OriginLocation":{"LocationCode":"NYC"},"RPH":"2","TPA_Extensions":{}}],"POS":{"Source":[{"RequestorID":{"CompanyName":{"Code":"TN"},"ID":"REQ.ID","Type":"0.AAA.X"},"PseudoCityCode":"F8SE"}]},"TPA_Extensions":{"IntelliSellTransaction":{"RequestType":{"Name":"200ITINS"}}},"TravelPreferences":{"CabinPref":[{"Cabin":"Y"}],"TPA_Extensions":{"NumTrips":{"Number":200},"FlexibleFares":{"FareParameters":[{}]}}},"TravelerInfoSummary":{"AirTravelerAvail":[{"PassengerTypeQuantity":[{"Code":"ADT","Quantity":1}]}],"PriceRequestInformation":{"TPA_Extensions":{"BrandedFareIndicators":{"ReturnCheapestUnbrandedFare":{"Ind":true},"SingleBrandedFare":true,"MultipleBrandedFares":false}}}}}}
    }

    request
    .defaults({'proxy': proxyUrl})
    .post({
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      url: 'https://sabreapibridge.crt.aws.sabrenow.com/sabreapibridge/api/v4.1.0/shop/flights?mode=live',
      body: getBody(),
      json: true
    }, function(err, response, body){
      if(err) cb(err)
      cb(null, body);
    });
  }
}

module.exports = BFMResource