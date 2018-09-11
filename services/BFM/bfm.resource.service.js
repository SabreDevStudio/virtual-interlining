'use strict'

const request = require('request')
const proxyUrl = require('../access')

const getBFMbody = BFMdetails => {
  return {
    "OTA_AirLowFareSearchRQ": {
      "OriginDestinationInformation": [
        {
          "DepartureDateTime": BFMdetails.DEPdateTimeLeg1,
          "DestinationLocation": {
            "LocationCode": BFMdetails.ARRLocation
          },
          "OriginLocation": {
            "LocationCode": BFMdetails.DEPLocation
          },
          "RPH": "1",
          "TPA_Extensions": {}
        }
      ],
      "POS": {
        "Source": [
          {
            "RequestorID": {
              "CompanyName": {
                "Code": "TN"
              },
              "ID": "REQ.ID",
              "Type": "0.AAA.X"
            },
            "PseudoCityCode": "F8SE"
          }
        ]
      },
      "TPA_Extensions": {
        "IntelliSellTransaction": {
          "RequestType": {
            "Name": "200ITINS"
          }
        }
      },
      "TravelPreferences": {
        "CabinPref": [
          {
            "Cabin": "Y"
          }
        ],
        "TPA_Extensions": {
          "NumTrips": {
            "Number": 200
          },
          "FlexibleFares": {
            "FareParameters": [
              {}
            ]
          }
        }
      },
      "TravelerInfoSummary": {
        "AirTravelerAvail": [
          {
            "PassengerTypeQuantity": [
              {
                "Code": "ADT",
                "Quantity": 1
              }
            ]
          }
        ],
        "PriceRequestInformation": {
          "TPA_Extensions": {
            "BrandedFareIndicators": {
              "ReturnCheapestUnbrandedFare": {
                "Ind": true
              },
              "SingleBrandedFare": true,
              "MultipleBrandedFares": false
            }
          }
        }
      }
    }
  }
}

const BFMResource = {
  getBFM: BFMdetails => {
    return new Promise((resolve, reject) => {
      request
        .defaults({'proxy': proxyUrl})
        .post({
          headers: {'Content-Type': 'application/json;charset=UTF-8'},
          url: 'https://sabreapibridge.crt.aws.sabrenow.com/sabreapibridge/api/v4.1.0/shop/flights?mode=live',
          body: getBFMbody(BFMdetails),
          json: true
        }, (err, response) => {
          if(err) {
            console.log('BFM err: ', err)
          } else {
            console.log('BFM: ', response.statusCode)
          }
          resolve(response)
        })
    })
  }
}

module.exports = BFMResource