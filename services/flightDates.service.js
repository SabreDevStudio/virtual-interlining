'use strict'

const APLOS = {
  AP: [1, 4, 6, 7, 10, 14, 20, 30, 60],
  LOS: [1, 3, 7, 14]
}

const getFlightDates = (AP, LOS) => {
  const millisecondsInOneDay = 1000 * 60 * 60 * 24
  let currentDateInMilliseconds = new Date().getTime()
  let departureDateInMilliseconds = currentDateInMilliseconds + (AP * millisecondsInOneDay)
  return {
    DEP: new Date(departureDateInMilliseconds),
    ARR: new Date(departureDateInMilliseconds + (LOS * millisecondsInOneDay))
  }
}

const getFlightDateList = () => {
  let flightDateList = []
  APLOS.AP.forEach(AP => {
    APLOS.LOS.forEach(LOS => {
      flightDateList.push(getFlightDates(AP, LOS))
    })
  })
  return flightDateList
}

module.exports = getFlightDateList