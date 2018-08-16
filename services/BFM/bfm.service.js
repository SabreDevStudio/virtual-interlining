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

  getBFMroundTripViaCity2: (BFMresource, currentFlight, direction, flightInitQuery) => {
    return new Promise((resolve, reject) => {
      if (currentFlight[direction].roundTripList.length) {
        console.log('currentFlight[direction].roundTripList: ', currentFlight[direction].roundTripList)
        BFMresource.getBFM({
          DEPLocation: currentFlight[direction].roundTripList[0]['1'].ORG,
          ARRLocation: currentFlight[direction].roundTripList[0]['1'].DCT,
          DEPdateTimeLeg1: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg1),
          DEPdateTimeLeg2: jsHelper.getFilteredDate(flightInitQuery.DEPdateTimeLeg2)
        }).then(chunk1 => {
          console.log('chunk1====================================');
          console.log(chunk1);
          resolve(chunk1)
          console.log('chunk1====================================');
        })
      } else {
        resolve()
      }
    })
  },

  getBFMviaTransferPoint: async function (BFMresource, currentFlight) {
      //handle currentFlight.directions.GDStoLCC
      
      if (currentFlight.directions.LCCtoGDS.source.length) {
        for (const GDStoLCCitem of currentFlight.directions.LCCtoGDS.source) {
          await BFMresource.getBFM({
            DEPLocation: GDStoLCCitem['1'].OCT,
            ARRLocation: GDStoLCCitem['1'].DCT,
            DEPdateTimeLeg1: jsHelper.getFilteredDate(currentFlight.flightInitQuery.DEPdateTimeLeg1)
          }).then(chunk1 => {
            currentFlight.directions.LCCtoGDS.chunk1list.push(chunk1.statusCode)
  
            return BFMresource.getBFM({
              DEPLocation: GDStoLCCitem['2'].OCT,
              ARRLocation: GDStoLCCitem['2'].DCT,
              DEPdateTimeLeg1: jsHelper.getFilteredDate(currentFlight.flightInitQuery.DEPdateTimeLeg1)
            })
          })
          .then(chunk2 => {
            currentFlight.directions.LCCtoGDS.chunk2list.push(chunk2.statusCode)//should PUSH not add
            // console.log('currentFlight===============: ', currentFlight);
            console.log('currentFlight...................: ', currentFlight)
            console.log('chunk1list......................: ', currentFlight.directions.LCCtoGDS.chunk1list)
            // resolve()
          })
        }
      }
      //handle currentFlight.directions.LCCtoGDS
    


    // let promises = currentFlight.direction.roundTripList.map(roundTrip => {
      
      // return new Promise((resolve, reject) => {
      //     BFMresource.getBFM({
      //       DEPLocation: roundTrip['1'].OCT,
      //       ARRLocation: roundTrip['1'].DCT,
      //       DEPdateTimeLeg1: jsHelper.getFilteredDate(currentFlight.flightInitQuery.DEPdateTimeLeg1),
      //       DEPdateTimeLeg2: jsHelper.getFilteredDate(currentFlight.flightInitQuery.DEPdateTimeLeg2)
      //     }).then(chunk1 => {
            
      //       if (chunk1.statusCode === 200) {
      //         console.log('chunk1.statusCode: ', chunk1.statusCode);
      //         currentFlight[direction].snowMan.chunk1.push(chunk1.body)
      //       }
  
      //       return BFMresource.getBFM({
      //         DEPLocation: roundTrip['2'].DCT,
      //         ARRLocation: roundTrip['2'].OCT,
      //         DEPdateTimeLeg1: jsHelper.getFilteredDate(currentFlight.flightInitQuery.DEPdateTimeLeg1),
      //         DEPdateTimeLeg2: jsHelper.getFilteredDate(currentFlight.flightInitQuery.DEPdateTimeLeg2)
      //       })
      //     })
      //     .then(chunk2 => {
      //       if (chunk2.statusCode === 200) {
      //         console.log('chunk2.statusCode: ', chunk2.statusCode);
      //           currentFlight[direction].snowMan.chunk2.push(chunk2.body)
      //         }
      //         console.log('snowMan: ', currentFlight[direction].snowMan);
      //         resolve()
      //       })
      // })
    // })

    // await Promise.all(promises)  
  }
}

module.exports = BFM