'use strict'

const getBFMBody = BFMdetails => {
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
}

module.exports = getBFMBody