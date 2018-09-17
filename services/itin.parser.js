const jsHelper = require('./jsHelper.service')

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

  return schedule.length ? schedule : []
}

const getYpsilonItin = (itin, flightSegments, transferCity) => {
  let newItinInstance = {}

  newItinInstance.transferPoint = transferCity
  newItinInstance.departureDateTime = flightSegments[0].depTime
  newItinInstance.arrivalDateTime = flightSegments[flightSegments.length - 1].arrTime
  newItinInstance.totalPrice = itin.price + itin.tax
  newItinInstance.amountOfStops = flightSegments.length - 1
  newItinInstance.carrier = itin.vcr
  newItinInstance.currency = itin.currency
  newItinInstance.tripCalendar = getTripCalendar(flightSegments, 'ypsilon')

  return newItinInstance
}
const getBFMitin = (itin, transferCity) => {
  let newItinInstance = {}
  let flightSegment = itin.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment

  newItinInstance.transferPoint = transferCity
  newItinInstance.departureDateTime = flightSegment[0].DepartureDateTime
  newItinInstance.arrivalDateTime = flightSegment[flightSegment.length - 1].ArrivalDateTime
  newItinInstance.totalPrice = itin.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount
  newItinInstance.amountOfStops = flightSegment.length - 1
  newItinInstance.carrier = itin.TPA_Extensions.ValidatingCarrier.Code
  newItinInstance.currency = itin.AirItineraryPricingInfo["0"].ItinTotalFare.TotalFare.CurrencyCode
  newItinInstance.tripCalendar = getTripCalendar(flightSegment, 'bfm')

  return newItinInstance
}

const parseResponseToItinList = response => {
  if (Array.isArray(response.body.tarifs)) {//Ypsilon
    if (response && response.statusCode === 200 && response.body && response.body.tarifs && response.body.tarifs.length) {
      let itinList = []

      response.body.tarifs.forEach(itin => {
        if (itin.outbound.flights.length > 1) {
          itin.outbound.flights.forEach(flight => {
            itinList.push(getYpsilonItin(itin, flight.segments, response.transferCity))
          })
        } else {
          itinList.push(getYpsilonItin(itin, itin.outbound.flights[0].segments, response.transferCity))
        }
      })
  
      return itinList
    } else {
      return []
    }
    
  } else {//BFM
    if (response && response.statusCode === 200 && response.body && response.body.OTA_AirLowFareSearchRS && 
      response.body.OTA_AirLowFareSearchRS.PricedItineraries && 
      response.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary) {
        return response.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.map(itin => {
          return getBFMitin(itin, response.transferCity)
        })
      } else {
        return []
      }
  }
}

module.exports = {
  parseResponseToItinList: parseResponseToItinList
}