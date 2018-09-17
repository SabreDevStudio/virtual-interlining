const colors = require('./colorCodes.service')
const currencyConverter = require('./currencyConverter.service')
const getMilisecondsInSetedHours = hour => 1000 * 60 * 60 * hour

const isDatesHaveEnoughTimeForTransfer = (date1, date2) => 
  new Date(date2).getTime() - new Date(date1).getTime() > getMilisecondsInSetedHours(2) &&
  new Date(date2).getTime() - new Date(date1).getTime() < getMilisecondsInSetedHours(6)

const sortArrayBySummarizedPriceInEuro = list => list.sort((a, b) => a.summarizedPriceInEuro - b.summarizedPriceInEuro)

const setCorrectCurrency = list => {
  return list.map(el => {
    el.summarizedPriceInEuro = currencyConverter.toEuro(el.itinA.totalPrice, el.itinA.currency) + 
                         currencyConverter.toEuro(el.itinB.totalPrice, el.itinB.currency)
    return el
  })
}

const getCombinableItinList = (chunk1list = [], chunk2list = []) => {
  let comparableItins = []
  if (chunk1list.length && chunk1list.length) {
    chunk1list.forEach(itinA => {
      process.stdout.write('.')
      chunk2list.forEach(itinB => {
        if (isDatesHaveEnoughTimeForTransfer(itinA.arrivalDateTime, itinB.departureDateTime) &&
        itinA.transferPoint === itinB.transferPoint) {
          comparableItins.push({itinA: itinA, itinB: itinB})
        }
      })
    })
  }
  return comparableItins
}

const getCheapest = (currentFlight, direction) => {
  let chunk1list = direction ? currentFlight.directions[direction].chunk1list : currentFlight.noDirections.chunk1List.result
  let chunk2list = direction ? currentFlight.directions[direction].chunk2list : currentFlight.noDirections.chunk2List.result

  return new Promise(resolve => {
    console.log('chunk 1 itins amount: ', chunk1list.length)
    console.log('chunk 2 itins amount : ', chunk2list.length)
    //filter arrays by transfet time and transfer point
    let comparableItinsList = getCombinableItinList(chunk1list, chunk2list)
    if (comparableItinsList.length) {
      comparableItinsList = setCorrectCurrency(comparableItinsList)
      let cheapestComparableItins = sortArrayBySummarizedPriceInEuro(comparableItinsList)[0]
      console.log(`${colors.yellow}${'\n'}Cheapest connection has been found.${colors.reset}`)
      resolve({
        itinA: cheapestComparableItins.itinA,
        itinB: cheapestComparableItins.itinB,
        summarizedPriceInEuro: cheapestComparableItins.summarizedPriceInEuro
      })
    } else {
      console.log(`${colors.red}No connection found.${colors.reset}`)
      resolve()
    }
  })
}

const cheapestConnection = {
  find: currentFlight => {
    return new Promise(resolve => {
      if (currentFlight.noDirections) {
        getCheapest(currentFlight).then(cheapestConnection => {
          currentFlight.noDirections.cheapestConnection = cheapestConnection
          resolve()
        })
      } else {
        getCheapest(currentFlight, 'LCCtoGDS')
        .then(cheapestConnection => {
          currentFlight.directions.LCCtoGDS.result = cheapestConnection
          return getCheapest(currentFlight, 'GDStoLCC')
        })
        .then(cheapestConnection => {
          currentFlight.directions.GDStoLCC.result = cheapestConnection
          resolve()
        })
      }
    })
  }
}

module.exports = cheapestConnection