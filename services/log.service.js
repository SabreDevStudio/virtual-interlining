const getTripCombination = (direction, currentFlight) => currentFlight.directions[direction].result

const getItinsTotalPrice = trip => trip ? trip.summarizedPrice : null

const getGDSprice = currentFlight => {
  return currentFlight.GDS ? currentFlight.GDS.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount : null
}

const isCheaper = (currentFlight, GDStoLCCtrip, LCCtoGDStrip) => {
  let GDSprice = getGDSprice(currentFlight)
  let LCCtoGDS_price = getItinsTotalPrice(LCCtoGDStrip)
  let GDStoLCC_price = getItinsTotalPrice(GDStoLCCtrip)

  if (!GDSprice) return false
  if (GDSprice && LCCtoGDS_price && !GDStoLCC_price) return LCCtoGDS_price < GDSprice
  if (GDSprice && !LCCtoGDS_price && GDStoLCC_price) return GDStoLCC_price < GDSprice
  if (GDSprice && LCCtoGDS_price && GDStoLCC_price) return (GDStoLCC_price < GDSprice) || (LCCtoGDS_price < GDSprice)
}

const getAmoutOfStops = GDS => GDS ? GDS.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment.length - 1 : null

const getViaCity = trip => trip ? trip.itinA.via.DCT : null

const getViaAirport = trip => {
  return trip ? trip.itinA.via.DST : null
}
//trip duration in hours
//depurture and arrival time of whole trip
//eirline per each segment
//errors in separate column

module.exports = (csvStream, currentFlight) => {
  let LCCtoGDStrip = getTripCombination('LCCtoGDS', currentFlight)
  let GDStoLCCtrip = getTripCombination('GDStoLCC', currentFlight)

  csvStream.write({
    DEP: currentFlight.flightInitQuery.DEPLocation,
    ARR: currentFlight.flightInitQuery.ARRLocation,
    DEP_date: currentFlight.flightInitQuery.DEPdateTimeLeg1,
    GDS: getGDSprice(currentFlight) || null,
    GDS_amount_of_stops: getAmoutOfStops(currentFlight.GDS),

    LCCtoGDS_price: getItinsTotalPrice(LCCtoGDStrip),
    LCCtoGDS_via_city: getViaCity(LCCtoGDStrip),
    LCCtoGDS_via_airport: getViaAirport(LCCtoGDStrip),
    LCCtoGDS_number_of_stops: LCCtoGDStrip ? LCCtoGDStrip.itinA.amountOfStops + LCCtoGDStrip.itinB.amountOfStops : null,

    GDStoLCC_price: getItinsTotalPrice(GDStoLCCtrip),
    GDStoLCC_via_city: getViaCity(GDStoLCCtrip),
    GDStoLCC_via_airport: getViaAirport(GDStoLCCtrip),
    GDStoLCC_number_of_stops: GDStoLCCtrip ? GDStoLCCtrip.itinA.amountOfStops + GDStoLCCtrip.itinB.amountOfStops : null,

    isCheaper: isCheaper(currentFlight, GDStoLCCtrip, LCCtoGDStrip)//true when cheaper than GDS
  });
}