'use strict'

const getBFMBody = () => {
  return {
    "OTA_AirLowFareSearchRQ": {
      "OriginDestinationInformation": [
        {
          "DepartureDateTime": "2018-08-13T00:00:00",
          "DestinationLocation": {
            "LocationCode": "NYC"
          },
          "OriginLocation": {
            "LocationCode": "FRA"
          },
          "RPH": "1",
          "TPA_Extensions": {}
        },
        {
          "DepartureDateTime": "2018-08-27T00:00:00",
          "DestinationLocation": {
            "LocationCode": "FRA"
          },
          "OriginLocation": {
            "LocationCode": "NYC"
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

module.exports = getBFMBody()