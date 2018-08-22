'use strict'

const getSortedItinListByPrice = list => list.sort((a, b) =>
      a.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount - b.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount)

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

  getTransferPointPromises: (BFMresource, currentFlight, direction, itemNumber, chunkListNumber, transferPoint) => {


    return currentFlight.directions[direction].source.map(directionItem => {
      return new Promise(resolve => {
        BFMresource.getBFM({
          DEPLocation: directionItem[itemNumber].OCT,
          ARRLocation: directionItem[itemNumber].DCT,
          DEPdateTimeLeg1: currentFlight.flightInitQuery.DEPdateTimeLeg1
        }).then(data => {
          if(data && data.statusCode === 200) {
            let itinList = data.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.map(el => {
              el.transferPoint = directionItem[itemNumber][transferPoint]
              el.via = {
                OCT: directionItem[itemNumber].OCT,
                DCT: directionItem[itemNumber].DCT,
                ORG: directionItem[itemNumber].ORG,
                DST: directionItem[itemNumber].DST
              }

              return el
            })

            currentFlight.directions[direction][chunkListNumber] = currentFlight.directions[direction][chunkListNumber].concat(itinList)
            console.log(`success BFM call for ${itemNumber} ${direction}: ${directionItem[itemNumber].OCT} => ${directionItem[itemNumber].DCT}`);
          }
          resolve()
        })
      })
    })
  },

  getBFMviaTransferPoint: async function (BFMresource, currentFlight, direction) {
    if (currentFlight.directions[direction].source.length) {
      currentFlight.directions[direction].source = BFM.getFiltereDeirectionsByUniqueTransferPoint(currentFlight, direction)

      let TransferPointPromisesChunk1 = BFM.getTransferPointPromises(BFMresource, currentFlight, direction, '1', 'chunk1list', 'DCT')
      let TransferPointPromisesChunk2 = BFM.getTransferPointPromises(BFMresource, currentFlight, direction, '2', 'chunk2list', 'OCT')

      await Promise.all(TransferPointPromisesChunk1.concat(TransferPointPromisesChunk2))
    }
  },

  handleBFMresponse: (currentFlight, BFMresponse) => {
    if (BFMresponse && BFMresponse.statusCode === 200) {
      currentFlight.GDS = getSortedItinListByPrice(BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary)[0]
      // currentFlight.GDS = Math.min(...BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary
      //   .map(el => el.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount))
    }
  }
}

module.exports = BFM