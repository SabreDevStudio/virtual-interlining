
'use strict'

const getSortedItinListByPrice = list => list.sort((a, b) =>
      a.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount - b.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount)

const BFM = {
  handleBFMresponse: (currentFlight, BFMresponse) => {
    return new Promise(resolve => {
      if (BFMresponse && BFMresponse.statusCode === 200 && BFMresponse.body &&
        BFMresponse.body.OTA_AirLowFareSearchRS &&
        BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries &&
        BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary) {
        currentFlight.GDS = getSortedItinListByPrice(BFMresponse.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary)[0]
      }
      resolve()
    })
  }
}

module.exports = BFM