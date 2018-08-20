const getMiliseconds = hour => 1000 * 60 * 60 * hour
const colors = require('./colorCodes.service')

const isDatesHaveEnoughTimeForTransfer = (date1, date2) => 
      new Date(date2).getTime() - new Date(date1).getTime() > getMiliseconds(2) &&
      new Date(date2).getTime() - new Date(date1).getTime() < getMiliseconds(6)

const sortArrayBySummarizedPrice = list => list.sort((a, b) => a.summarizedPrice - b.summarizedPrice)

const findCheapestConnection = (currentFlight, direction) => {
  return new Promise(resolve => {
    if (currentFlight.directions[direction].chunk1list.length && currentFlight.directions[direction].chunk2list.length) {
      let comparableItins = []

      currentFlight.directions[direction].chunk1list.forEach(itinA => {
        process.stdout.write('.')
        currentFlight.directions[direction].chunk2list.forEach(itinB => {
          let itinAFlightSegment = itinA.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment
          let itinBFlightSegment = itinB.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment

          if(isDatesHaveEnoughTimeForTransfer(itinAFlightSegment[itinAFlightSegment.length - 1].ArrivalDateTime,
            itinBFlightSegment[0].DepartureDateTime)) {
              comparableItins.push({itinA: itinA, itinB: itinB})
          }
        })
      })

      let comparableItinsList = comparableItins.map(el => {
        el.summarizedPrice = el.itinA.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount + 
                            el.itinB.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount
        return el
      })

      let cheapestComparableItins = sortArrayBySummarizedPrice(comparableItinsList)[0]
      currentFlight.directions[direction].result = {
        itinAprice: cheapestComparableItins.itinA.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount,
        itinBprice: cheapestComparableItins.itinB.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount
      }
      console.log(`${colors.yellow}${'\n'}Cheapest connection has been found for ${direction}.${colors.reset}`);
      
      resolve()
    } else {
      console.log(`${colors.red}No connection for ${direction}.${colors.reset}`);
      resolve()
    }
  })
}

module.exports = findCheapestConnection