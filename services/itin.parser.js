const setTransferAndViaData = (el, directionItem, itemNumber, transferPoint) => {
  el.transferPoint = directionItem[itemNumber][transferPoint]
  el.via = {
    OCT: directionItem[itemNumber].OCT,
    DCT: directionItem[itemNumber].DCT,
    ORG: directionItem[itemNumber].ORG,
    DST: directionItem[itemNumber].DST
  }
  return el
}

const getYpsilonItin = (el, directionItem, itemNumber, transferPoint) => {
  setTransferAndViaData(el, directionItem, itemNumber, transferPoint)
  let flightSegment = el.outbound.flights[0].segments
  el.departureDateTime = flightSegment[0].depTime
  el.arrivalDateTime = flightSegment[flightSegment.length - 1].arrTime
  el.totalPrice = el.price + el.tax,
  el.amountOfStops = flightSegment.length - 1
  return el
}
const getBFMitin = (el, directionItem, itemNumber, transferPoint) => {
  setTransferAndViaData(el, directionItem, itemNumber, transferPoint)
  let flightSegment = el.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment
  el.departureDateTime = flightSegment[0].DepartureDateTime
  el.arrivalDateTime = flightSegment[flightSegment.length - 1].ArrivalDateTime
  el.totalPrice = el.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount
  el.amountOfStops = flightSegment.length - 1
  return el
}

module.exports = {
  getBFMitin: getBFMitin,
  getYpsilonItin: getYpsilonItin
}