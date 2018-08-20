'use strict'

const jsHelper = require('../jsHelper.service')

const BFM = {
  getBFMbody: BFMdetails => {
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
  },

  getFiltereDeirectionsByUniqueTransferPoint: (currentFlight, direction) => {
    let uniqueValues = []
    return currentFlight.directions[direction].source.filter(el => {
      if (!uniqueValues.length || uniqueValues.indexOf(el['1'].DCT) === -1) {
        uniqueValues.push(el['1'].DCT)
        return true
      } else {
        return false
      }
    })
  },

  getBFMviaTransferPoint: async function (BFMresource, currentFlight, direction) {
    if (currentFlight.directions[direction].source.length) {
      currentFlight.directions[direction].source = BFM.getFiltereDeirectionsByUniqueTransferPoint(currentFlight, direction)
      let TransferPointPromises = currentFlight.directions[direction].source.map(directionItem => {
        return new Promise(resolve => {
          BFMresource.getBFM({
            DEPLocation: directionItem['1'].OCT,
            ARRLocation: directionItem['1'].DCT,
            DEPdateTimeLeg1: currentFlight.flightInitQuery.DEPdateTimeLeg1
          }).then(chunk1 => {
            if(chunk1 && chunk1.statusCode === 200) {
              let itinList = chunk1.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.map(el => {
                el.transferPoint = directionItem['1'].DCT
                return el
              })

              currentFlight.directions[direction].chunk1list = currentFlight.directions[direction].chunk1list.concat(itinList)
              console.log(`success BFM call for 1 ${direction}: ${directionItem['1'].OCT} => ${directionItem['1'].DCT}`);
            }
            return BFMresource.getBFM({
              DEPLocation: directionItem['2'].OCT,
              ARRLocation: directionItem['2'].DCT,
              DEPdateTimeLeg1: currentFlight.flightInitQuery.DEPdateTimeLeg1
            })
          })
          .then(chunk2 => {
            if(chunk2 && chunk2.statusCode === 200) {
              let itinList = chunk2.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.map(el => {
                el.transferPoint = directionItem['2'].OCT
                return el
              })

              currentFlight.directions[direction].chunk2list = currentFlight.directions[direction].chunk2list.concat(itinList)
              console.log(`success BFM call for 2 ${direction}: ${directionItem['2'].OCT} => ${directionItem['2'].DCT}`);
            }
            resolve()
          })
        })
      })

      await Promise.all(TransferPointPromises)
    }
  },

  handleBFMresponse: (currentFlight, BFMresponse) => {
    if (BFMresponse && BFMresponse.statusCode === 200) {
      currentFlight.GDS = Math.min(...BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary
        .map(el => el.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount))
    } else {
      currentFlight.GDS = 'no data'
    }
  }
}

module.exports = BFM