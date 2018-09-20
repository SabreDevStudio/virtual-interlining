const moment = require('moment')
const currencyConverter = require('./currencyConverter.service')

const getTripCombination = (direction, currentFlight) => {
  if (direction && currentFlight && currentFlight.directions && currentFlight.directions[direction]) {
    return currentFlight.directions[direction].result
  } else if (currentFlight.noDirections && currentFlight.noDirections.cheapestConnection) {
    return currentFlight.noDirections.cheapestConnection
  } else {
    return null
  }
}

const getItinsTotalPrice = trip => trip ? currencyConverter.roundNumber(trip.summarizedPriceInEuro) : null

const getGDSprice = currentFlight => {
  if (currentFlight.GDS) {
    let amount = currentFlight.GDS.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount
    let currency = currentFlight.GDS.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.CurrencyCode
    return currencyConverter.roundNumber(currencyConverter.toEuro(amount, currency))
  } else {
    return null
  }
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

const getSegmentChunk = (list, index, chunk) => list[index] ? list[index][chunk] : null
const getHoursBetweenDates = (date1, date2) => {
  if (date1, date2) {
    let duration = moment.duration(moment(date2).diff(moment(date1)))
    return `${duration.get("hours")}:${duration.get("minutes")}`
  } else {
    return null
  }
}

const writeDirectionalTrip = (csvStream, currentFlight, cb) => {
  let LCCtoGDStrip = getTripCombination('LCCtoGDS', currentFlight)
  let GDStoLCCtrip = getTripCombination('GDStoLCC', currentFlight)
  let LCCtoGDSsegments = LCCtoGDStrip ? LCCtoGDStrip.itinA.tripCalendar.concat(LCCtoGDStrip.itinB.tripCalendar) : []
  let GDStoLCCsegments = GDStoLCCtrip ? GDStoLCCtrip.itinA.tripCalendar.concat(GDStoLCCtrip.itinB.tripCalendar) : []

  csvStream.write({
    DEP: currentFlight.flightInitQuery.DEPLocation,
    ARR: currentFlight.flightInitQuery.ARRLocation,
    DEP_date: currentFlight.flightInitQuery.DEPdateTimeLeg1,

    GDS: getGDSprice(currentFlight) || null,
    GDS_amount_of_stops: getAmoutOfStops(currentFlight.GDS),
    LCCtoGDS_price: getItinsTotalPrice(LCCtoGDStrip),
    LCCtoGDS_number_of_stops: LCCtoGDStrip ? LCCtoGDStrip.itinA.amountOfStops + LCCtoGDStrip.itinB.amountOfStops + 1: null,
    LCCtoGDS_carrier_to_transfer_point: LCCtoGDStrip ? LCCtoGDStrip.itinA.carrier : null,
    LCCtoGDS_carrier_from_transfer_point: LCCtoGDStrip ? LCCtoGDStrip.itinB.carrier : null,
    LCCtoGDS_seg1_dep_time: getSegmentChunk(LCCtoGDSsegments, 0, 'depTime'),
    LCCtoGDS_seg1_arr_time: getSegmentChunk(LCCtoGDSsegments, 0, 'arrTime'),
    LCCtoGDS_seg1_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(LCCtoGDSsegments, 0, 'arrTime'), getSegmentChunk(LCCtoGDSsegments, 1, 'depTime')),
    LCCtoGDS_seg1_dep_from: getSegmentChunk(LCCtoGDSsegments, 0, 'depFrom'),
    LCCtoGDS_seg1_arr_to: getSegmentChunk(LCCtoGDSsegments, 0, 'arrTo'),

    LCCtoGDS_seg2_dep_time: getSegmentChunk(LCCtoGDSsegments, 1, 'depTime'),
    LCCtoGDS_seg2_arr_time: getSegmentChunk(LCCtoGDSsegments, 1, 'arrTime'),
    LCCtoGDS_seg2_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(LCCtoGDSsegments, 1, 'arrTime'), getSegmentChunk(LCCtoGDSsegments, 2, 'depTime')),
    LCCtoGDS_seg2_dep_from: getSegmentChunk(LCCtoGDSsegments, 1, 'depFrom'),
    LCCtoGDS_seg2_arr_to: getSegmentChunk(LCCtoGDSsegments, 1, 'arrTo'),

    LCCtoGDS_seg3_dep_time: getSegmentChunk(LCCtoGDSsegments, 2, 'depTime'),
    LCCtoGDS_seg3_arr_time: getSegmentChunk(LCCtoGDSsegments, 2, 'arrTime'),
    LCCtoGDS_seg3_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(LCCtoGDSsegments, 2, 'arrTime'), getSegmentChunk(LCCtoGDSsegments, 3, 'depTime')),
    LCCtoGDS_seg3_dep_from: getSegmentChunk(LCCtoGDSsegments, 2, 'depFrom'),
    LCCtoGDS_seg3_arr_to: getSegmentChunk(LCCtoGDSsegments, 2, 'arrTo'),

    LCCtoGDS_seg4_dep_time: getSegmentChunk(LCCtoGDSsegments, 3, 'depTime'),
    LCCtoGDS_seg4_arr_time: getSegmentChunk(LCCtoGDSsegments, 3, 'arrTime'),
    LCCtoGDS_seg4_dep_from: getSegmentChunk(LCCtoGDSsegments, 3, 'depFrom'),
    LCCtoGDS_seg4_arr_to: getSegmentChunk(LCCtoGDSsegments, 3, 'arrTo'),

    GDStoLCC_price: getItinsTotalPrice(GDStoLCCtrip),
    GDStoLCC_number_of_stops: GDStoLCCtrip ? GDStoLCCtrip.itinA.amountOfStops + GDStoLCCtrip.itinB.amountOfStops + 1: null,
    GDStoLCC_carrier_to_transfer_point: GDStoLCCtrip ? GDStoLCCtrip.itinA.carrier : null,
    GDStoLCC_carrier_from_transfer_point: GDStoLCCtrip ? GDStoLCCtrip.itinB.carrier : null,
    GDStoLCC_seg1_dep_time: getSegmentChunk(GDStoLCCsegments, 0, 'depTime'),
    GDStoLCC_seg1_arr_time: getSegmentChunk(GDStoLCCsegments, 0, 'arrTime'),
    GDStoLCC_seg1_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(GDStoLCCsegments, 0, 'arrTime'), getSegmentChunk(GDStoLCCsegments, 1, 'depTime')),
    GDStoLCC_seg1_dep_from: getSegmentChunk(GDStoLCCsegments, 0, 'depFrom'),
    GDStoLCC_seg1_arr_to: getSegmentChunk(GDStoLCCsegments, 0, 'arrTo'),

    GDStoLCC_seg2_dep_time: getSegmentChunk(GDStoLCCsegments, 1, 'depTime'),
    GDStoLCC_seg2_arr_time: getSegmentChunk(GDStoLCCsegments, 1, 'arrTime'),
    GDStoLCC_seg2_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(GDStoLCCsegments, 1, 'arrTime'), getSegmentChunk(GDStoLCCsegments, 2, 'depTime')),
    GDStoLCC_seg2_dep_from: getSegmentChunk(GDStoLCCsegments, 1, 'depFrom'),
    GDStoLCC_seg2_arr_to: getSegmentChunk(GDStoLCCsegments, 1, 'arrTo'),

    GDStoLCC_seg3_dep_time: getSegmentChunk(GDStoLCCsegments, 2, 'depTime'),
    GDStoLCC_seg3_arr_time: getSegmentChunk(GDStoLCCsegments, 2, 'arrTime'),
    GDStoLCC_seg3_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(GDStoLCCsegments, 2, 'arrTime'), getSegmentChunk(GDStoLCCsegments, 3, 'depTime')),
    GDStoLCC_seg3_dep_from: getSegmentChunk(GDStoLCCsegments, 2, 'depFrom'),
    GDStoLCC_seg3_arr_to: getSegmentChunk(GDStoLCCsegments, 2, 'arrTo'),

    GDStoLCC_seg4_dep_time: getSegmentChunk(GDStoLCCsegments, 3, 'depTime'),
    GDStoLCC_seg4_arr_time: getSegmentChunk(GDStoLCCsegments, 3, 'arrTime'),
    GDStoLCC_seg4_dep_from: getSegmentChunk(GDStoLCCsegments, 3, 'depFrom'),
    GDStoLCC_seg4_arr_to: getSegmentChunk(GDStoLCCsegments, 3, 'arrTo'),

    isCheaper: isCheaper(currentFlight, GDStoLCCtrip, LCCtoGDStrip)//true when cheaper than GDS
  }, () => cb())
}

const writeNoDirectionalTrip = (csvStream, currentFlight, cb) => {

  let noDirectionalTrip = getTripCombination(null, currentFlight)
  let gdsPrice = getGDSprice(currentFlight) || null
  let viPrice = getItinsTotalPrice(noDirectionalTrip)
  // console.log('getGDSprice: ', getGDSprice(currentFlight))
  // console.log('currentFlight A: ', noDirectionalTrip ? noDirectionalTrip.itinA : '')
  // console.log('currentFlight B: ', noDirectionalTrip ? noDirectionalTrip.itinB : '')
  let segmentList = noDirectionalTrip ? noDirectionalTrip.itinA.tripCalendar.concat(noDirectionalTrip.itinB.tripCalendar) : []


  csvStream.write({
    DEP: currentFlight.flightInitQuery.DEPLocation,
    ARR: currentFlight.flightInitQuery.ARRLocation,
    DEP_date: currentFlight.flightInitQuery.DEPdateTimeLeg1,

    GDS: gdsPrice,
    GDS_amount_of_stops: getAmoutOfStops(currentFlight.GDS),

    Price: viPrice,
    Number_of_stops: noDirectionalTrip ? noDirectionalTrip.itinA.amountOfStops + noDirectionalTrip.itinB.amountOfStops + 1: null,
    Carrier_to_transfer_point: noDirectionalTrip ? noDirectionalTrip.itinA.carrier : null,
    Carrier_from_transfer_point: noDirectionalTrip ? noDirectionalTrip.itinB.carrier : null,

    seg1_dep_time: getSegmentChunk(segmentList, 0, 'depTime'),
    seg1_arr_time: getSegmentChunk(segmentList, 0, 'arrTime'),
    seg1_dep_from: getSegmentChunk(segmentList, 0, 'depFrom'),
    seg1_arr_to: getSegmentChunk(segmentList, 0, 'arrTo'),
    seg1_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(segmentList, 0, 'arrTime'), getSegmentChunk(segmentList, 1, 'depTime')),

    seg2_dep_time: getSegmentChunk(segmentList, 1, 'depTime'),
    seg2_arr_time: getSegmentChunk(segmentList, 1, 'arrTime'),
    seg2_dep_from: getSegmentChunk(segmentList, 1, 'depFrom'),
    seg2_arr_to: getSegmentChunk(segmentList, 1, 'arrTo'),
    seg2_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(segmentList, 1, 'arrTime'), getSegmentChunk(segmentList, 2, 'depTime')),

    seg3_dep_time: getSegmentChunk(segmentList, 2, 'depTime'),
    seg3_arr_time: getSegmentChunk(segmentList, 2, 'arrTime'),
    seg3_dep_from: getSegmentChunk(segmentList, 2, 'depFrom'),
    seg3_arr_to: getSegmentChunk(segmentList, 2, 'arrTo'),
    seg3_hours_to_next_flight: getHoursBetweenDates(getSegmentChunk(segmentList, 2, 'arrTime'), getSegmentChunk(segmentList, 3, 'depTime')),
    
    seg4_dep_time: getSegmentChunk(segmentList, 3, 'depTime'),
    seg4_arr_time: getSegmentChunk(segmentList, 3, 'arrTime'),
    seg4_dep_from: getSegmentChunk(segmentList, 3, 'depFrom'),
    seg4_arr_to: getSegmentChunk(segmentList, 3, 'arrTo'),

    isCheaper: gdsPrice && viPrice ? viPrice < gdsPrice : false//true when cheaper than GDS
  }, () => cb())
}

module.exports = (csvStream, currentFlight) => {
  return new Promise(resolve => {
    if (currentFlight.noDirections) {
      writeNoDirectionalTrip(csvStream, currentFlight, () => resolve())

      resolve()
    } else {
      writeDirectionalTrip(csvStream, currentFlight, () => resolve())
    }
  })
}