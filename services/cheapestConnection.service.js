const colors = require('./colorCodes.service')
const getMiliseconds = hour => 1000 * 60 * 60 * hour

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
          if(isDatesHaveEnoughTimeForTransfer(itinA.arrivalDateTime, itinB.departureDateTime) &&
              itinA.transferPoint === itinB.transferPoint) {
              comparableItins.push({itinA: itinA, itinB: itinB})
          }
        })
      })

      if (comparableItins.length) {
        let comparableItinsList = comparableItins.map(el => {
          el.summarizedPrice = el.itinA.totalPrice + el.itinB.totalPrice
          return el
        })

        let cheapestComparableItins = sortArrayBySummarizedPrice(comparableItinsList)[0]
        currentFlight.directions[direction].result = {
          itinA: cheapestComparableItins.itinA,
          itinB: cheapestComparableItins.itinB,
          summarizedPrice: cheapestComparableItins.summarizedPrice
        }
        console.log(`${colors.yellow}${'\n'}Cheapest connection has been found for ${direction}.${colors.reset}`);
      } else {
        console.log('NO comparableItins........!');
      }
      resolve()
    } else {
      console.log(`${colors.red}No connection for ${direction}.${colors.reset}`);
      resolve()
    }
  })
}

module.exports = findCheapestConnection