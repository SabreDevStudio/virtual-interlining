
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

  getTransferPointPromises: (BFMresource, ypsilonResource, itinParser, currentFlight, direction, itemNumber, chunkListNumber, transferPoint) => {
    return currentFlight.directions[direction].source.map(directionItem => {
      if (directionItem[itemNumber].LCC === 'true') {
        return new Promise(resolve => {
          ypsilonResource.getItins({
            depDate: currentFlight.flightInitQuery.DEPdateTimeLeg1.split('T')[0],
            depCity: directionItem[itemNumber].OCT,
            dstCity: directionItem[itemNumber].DCT
          }).then(ypsilonData => {
            if (ypsilonData && ypsilonData.statusCode === 200 && ypsilonData.body && ypsilonData.body.tarifs) {
              console.log('old ItinList: ', ypsilonData.body.tarifs.length);
              let newItinList = []

              if (ypsilonData.body.tarifs.length) {
                ypsilonData.body.tarifs.forEach(el => {
                  if (el.outbound.flights.length > 1) {
                    el.outbound.flights.forEach(flight => {
                      newItinList.push(itinParser.getYpsilonItin(el, directionItem, itemNumber, transferPoint, flight.segments))
                    })
                  } else {
                    newItinList.push(itinParser.getYpsilonItin(el, directionItem, itemNumber, transferPoint, el.outbound.flights[0].segments))
                  }
                })
              }
              
              console.log('newItinList: ', newItinList.length);

              currentFlight.directions[direction][chunkListNumber] = currentFlight.directions[direction][chunkListNumber].concat(newItinList)
              console.log(`success Ypsilon call for ${itemNumber} ${direction}: ${directionItem[itemNumber].OCT} => ${directionItem[itemNumber].DCT}, ${newItinList.length}`);
            }
            resolve()
          })
        })
      } else {
        return new Promise(resolve => {
          BFMresource.getBFM({
            DEPLocation: directionItem[itemNumber].OCT,
            ARRLocation: directionItem[itemNumber].DCT,
            DEPdateTimeLeg1: currentFlight.flightInitQuery.DEPdateTimeLeg1
          }).then(data => {
            if(data && data.statusCode === 200 && data.body && data.body.OTA_AirLowFareSearchRS && 
              data.body.OTA_AirLowFareSearchRS.PricedItineraries && 
              data.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary) {
              let itinList = data.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary
              .map(el => itinParser.getBFMitin(el, directionItem, itemNumber, transferPoint))
  
              currentFlight.directions[direction][chunkListNumber] = currentFlight.directions[direction][chunkListNumber].concat(itinList)
              console.log(`success BFM call for ${itemNumber} ${direction}: ${directionItem[itemNumber].OCT} => ${directionItem[itemNumber].DCT}, ${itinList.length}`);
            }
            resolve()
          })
        })
      }
    })
  },

  getBFMviaTransferPoint: async function (BFMresource, ypsilonResource, itinParser, currentFlight, direction) {
    if (currentFlight.directions[direction].source.length) {
      currentFlight.directions[direction].source = BFM.getFiltereDeirectionsByUniqueTransferPoint(currentFlight, direction)

      let TransferPointPromisesChunk1 = BFM.getTransferPointPromises(BFMresource, ypsilonResource, itinParser, currentFlight, direction, '1', 'chunk1list', 'DCT')
      let TransferPointPromisesChunk2 = BFM.getTransferPointPromises(BFMresource, ypsilonResource, itinParser, currentFlight, direction, '2', 'chunk2list', 'OCT')

      await Promise.all(TransferPointPromisesChunk1.concat(TransferPointPromisesChunk2))
    }
  },

  handleBFMresponse: (currentFlight, BFMresponse) => {
    if (BFMresponse && BFMresponse.statusCode === 200 && BFMresponse.body &&
      BFMresponse.body.OTA_AirLowFareSearchRS &&
      BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries &&
      BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary) {
      currentFlight.GDS = getSortedItinListByPrice(BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary)[0]
    }
  }
}

module.exports = BFM