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
          },
          {
            "DepartureDateTime": BFMdetails.DEPdateTimeLeg2,
            "DestinationLocation": {
              "LocationCode": BFMdetails.DEPLocation
            },
            "OriginLocation": {
              "LocationCode": BFMdetails.ARRLocation
            },
            "RPH": "2",
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

  getBFMroundTripViaCity2: (BFMresource, currentFlight, direction, flightInitQuery) => {
    return new Promise((resolve, reject) => {
      BFMresource.getBFM({
        DEPLocation: currentFlight[direction].roundTripList[0]['1'].OCT,
        ARRLocation: currentFlight[direction].roundTripList[0]['1'].DCT,
        DEPdateTimeLeg1: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg1),
        DEPdateTimeLeg2: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg2)
      }).then(chunk1 => {
        
        if (chunk1.statusCode === 200) {
          console.log('chunk1.statusCode: ', chunk1.statusCode);
          currentFlight[direction].snowMan.chunk1.push(chunk1.body)
        }

        return BFMresource.getBFM({
          DEPLocation: currentFlight[direction].roundTripList[0]['2'].DCT,
          ARRLocation: currentFlight[direction].roundTripList[0]['2'].OCT,
          DEPdateTimeLeg1: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg1),
          DEPdateTimeLeg2: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg2)
        })
      })
      .then(chunk2 => {
        if (chunk2.statusCode === 200) {
          console.log('chunk2.statusCode: ', chunk2.statusCode);
          currentFlight[direction].snowMan.chunk2.push(chunk2.body)
        }
          console.log('snowMan: ', currentFlight[direction].snowMan);
          resolve()
        })
    })
  },

  getBFMroundTripViaCity: async function (BFMresource, currentFlight, direction, flightInitQuery) {
    let promises = currentFlight[direction].roundTripList.map(roundTrip => {
      console.log('roundTrip: ', roundTrip);
      
      return new Promise((resolve, reject) => {
          BFMresource.getBFM({
            DEPLocation: roundTrip['1'].OCT,
            ARRLocation: roundTrip['1'].DCT,
            DEPdateTimeLeg1: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg1),
            DEPdateTimeLeg2: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg2)
          }).then(chunk1 => {
            
            if (chunk1.statusCode === 200) {
              console.log('chunk1.statusCode: ', chunk1.statusCode);
              currentFlight[direction].snowMan.chunk1.push(chunk1.body)
            }
  
            return BFMresource.getBFM({
              DEPLocation: roundTrip['2'].DCT,
              ARRLocation: roundTrip['2'].OCT,
              DEPdateTimeLeg1: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg1),
              DEPdateTimeLeg2: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg2)
            })
          })
          .then(chunk2 => {
            if (chunk2.statusCode === 200) {
              console.log('chunk2.statusCode: ', chunk2.statusCode);
                currentFlight[direction].snowMan.chunk2.push(chunk2.body)
              }
              console.log('snowMan: ', currentFlight[direction].snowMan);
              resolve()
            })
      })
    })

    await Promise.all(promises)
    // wstream.end();
    console.log('done done done!');
  }
}

module.exports = BFM