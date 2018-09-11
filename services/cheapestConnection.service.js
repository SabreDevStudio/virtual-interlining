const colors = require('./colorCodes.service')
const currencyConverter = require('./currencyConverter.service')
const getMilisecondsInSetedHours = hour => 1000 * 60 * 60 * hour

const isDatesHaveEnoughTimeForTransfer = (date1, date2) => 
  new Date(date2).getTime() - new Date(date1).getTime() > getMilisecondsInSetedHours(2) &&
  new Date(date2).getTime() - new Date(date1).getTime() < getMilisecondsInSetedHours(6)

const sortArrayBySummarizedPriceInEuro = list => list.sort((a, b) => a.summarizedPriceInEuro - b.summarizedPriceInEuro)

const cheapestConnection = {
  find: currentFlight => {
    return new Promise(resolve => {
      cheapestConnection.getCheapest(currentFlight, 'LCCtoGDS').then(() => {
        cheapestConnection.getCheapest(currentFlight, 'GDStoLCC').then(() => {
          resolve()
        })
      })
    })
  },
  getCheapest: (currentFlight, direction) => {
    return new Promise(resolve => {
      if (currentFlight.directions[direction].chunk1list.length && currentFlight.directions[direction].chunk2list.length) {
        let comparableItins = []
  
        currentFlight.directions[direction].chunk1list.forEach(itinA => {
          process.stdout.write('.')
          currentFlight.directions[direction].chunk2list.forEach(itinB => {
            if(isDatesHaveEnoughTimeForTransfer(itinA.arrivalDateTime, itinB.departureDateTime) &&
                itinA.transferPoint === itinB.transferPoint) {
                  console.log('itinA transferPoint: ', itinA.transferPoint)
                  console.log('itinB transferPoint: ', itinB.transferPoint)

                  console.log('itinA arrTo: ', itinA.tripCalendar[0].arrTo)
                  console.log('itinB depFrom: ', itinB.tripCalendar[itinB.tripCalendar.length - 1].depFrom)
                  console.log('=======================');
                  
                  
                comparableItins.push({itinA: itinA, itinB: itinB})
            }
          })
        })
  
        if (comparableItins.length) {
          let comparableItinsList = comparableItins.map(el => {
            el.summarizedPriceInEuro = currencyConverter.toEuro(el.itinA.totalPrice, el.itinA.currency) + 
                                 currencyConverter.toEuro(el.itinB.totalPrice, el.itinB.currency)
            return el
          })
  
          let cheapestComparableItins = sortArrayBySummarizedPriceInEuro(comparableItinsList)[0]
          currentFlight.directions[direction].result = {
            itinA: cheapestComparableItins.itinA,
            itinB: cheapestComparableItins.itinB,
            summarizedPriceInEuro: cheapestComparableItins.summarizedPriceInEuro
          }
          console.log(`${colors.yellow}${'\n'}Cheapest connection has been found for ${direction}.${colors.reset}`)
        } else {
          console.log('NO comparableItins........!')
        }
        resolve()
      } else {
        console.log(`${colors.red}No connection for ${direction}.${colors.reset}`)
        resolve()
      }
    })
  }
}

module.exports = cheapestConnection