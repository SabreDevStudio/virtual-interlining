const jsHelper = require('./jsHelper.service')

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

const getTripCalendar = (flights = [], apiName) => {
  let schedule = []
  if (apiName === 'bfm') {
    flights.forEach(el => {
      schedule.push({
        depFrom: el.DepartureAirport.LocationCode,
        arrTo: el.ArrivalAirport.LocationCode,
        depTime: jsHelper.getFilteredDateWithTime(new Date(el.DepartureDateTime)), 
        arrTime: jsHelper.getFilteredDateWithTime(new Date(el.ArrivalDateTime))
      })
    })
  }
  if (apiName === 'ypsilon') {
    flights.forEach(el => {
      schedule.push({
        depFrom: el.depApt,
        arrTo: el.dstApt,
        depTime: jsHelper.getFilteredDateWithTime(new Date(el.depTime)),
        arrTime: jsHelper.getFilteredDateWithTime(new Date(el.arrTime))
      })
    })
  }

  return schedule.length ? schedule : null
}

const getYpsilonItin = (el, directionItem, itemNumber, transferPoint, flightSegments) => {
  setTransferAndViaData(el, directionItem, itemNumber, transferPoint)
  el.departureDateTime = flightSegments[0].depTime
  el.arrivalDateTime = flightSegments[flightSegments.length - 1].arrTime
  el.totalPrice = el.price + el.tax,
  el.amountOfStops = flightSegments.length - 1
  el.carrier = el.vcr
  el.tripCalendar = getTripCalendar(flightSegments, 'ypsilon')
  return el
}
const getBFMitin = (el, directionItem, itemNumber, transferPoint) => {
  setTransferAndViaData(el, directionItem, itemNumber, transferPoint)
  let flightSegment = el.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment
  el.departureDateTime = flightSegment[0].DepartureDateTime
  el.arrivalDateTime = flightSegment[flightSegment.length - 1].ArrivalDateTime
  el.totalPrice = el.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount
  el.amountOfStops = flightSegment.length - 1
  el.carrier = el.TPA_Extensions.ValidatingCarrier.Code
  el.tripCalendar = getTripCalendar(flightSegment, 'bfm')
  return el
}

module.exports = {
  getBFMitin: getBFMitin,
  getYpsilonItin: getYpsilonItin
}