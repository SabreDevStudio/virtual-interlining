const BFMresource = require('./BFM/bfm.resource.service')
const ypsilonResource = require('./ypsilon/ypsilon.resource.service')
const itinParser = require('./itin.parser')
const DSS = require('./DSS/dss.service')

const getFiltereDirectionsByUniqueTransferPoint = (currentFlight, direction) => {
  let uniqueValues = []
  return currentFlight.directions[direction].source.filter(el => {
    if (!uniqueValues.length || uniqueValues.indexOf(el['1'].DCT) === -1) {
      uniqueValues.push(el['1'].DCT)
      return true
    } else {
      return false
    }
  })
}

const getChunkList = (currentFlight, chunkNumber) => {
  return currentFlight.transferPointList.map(el => {
    return {
      DEP: chunkNumber === 1 ? currentFlight.flightInitQuery.DEPLocation : el,
      ARR: chunkNumber === 1 ? el : currentFlight.flightInitQuery.ARRLocation,
      date: currentFlight.flightInitQuery.DEPdateTimeLeg1
    }
  })
}

const getItineraryViaTransferPoint = async function (currentFlight, direction) {
  if (!direction && currentFlight.transferPointList && currentFlight.transferPointList.length) {
    currentFlight.noDirections = {
      source: {
        chunk1List: getChunkList(currentFlight, 1),
        chunk2List: getChunkList(currentFlight, 2)
      }
    }

    // console.log('chunk1List: ', chunk1List)
    // console.log('chunk2List: ', chunk2List)
    
    
    //no directions case
  } else if (direction && currentFlight.directions[direction].source.length) {
    currentFlight.directions[direction].source = getFiltereDirectionsByUniqueTransferPoint(currentFlight, direction)

    let TransferPointPromisesChunk1 = chooseBetwinPromisesApis(currentFlight, direction, 1, 'DCT')//DCT - destination city || arrival of chunk1
    let TransferPointPromisesChunk2 = chooseBetwinPromisesApis(currentFlight, direction, 2, 'OCT')//OCT - origin city || departure of chunk2

    await Promise.all(TransferPointPromisesChunk1.concat(TransferPointPromisesChunk2))
  }
}

const chooseBetwinPromisesApis = (currentFlight, direction, chunkNumber, transferCityPoint) => {
  return currentFlight.directions[direction].source.map(DSSitem => {
    console.log('DSSitem: ', DSSitem);
    
    if (DSSitem[chunkNumber].LCC === 'true') {
      return getTransfersViaYpsilon(currentFlight, direction, chunkNumber, transferCityPoint, DSSitem)
    } else {
      return getTransfersViaBFM(currentFlight, direction, chunkNumber, transferCityPoint, DSSitem)
    }
  })
}

const getTransfersViaYpsilon = (currentFlight, direction, chunkNumber, transferCityPoint, DSSitem) => {
  return new Promise(resolve => {
    ypsilonResource.getItins({
      depDate: currentFlight.flightInitQuery.DEPdateTimeLeg1.split('T')[0],
      depCity: DSSitem[chunkNumber].OCT,
      dstCity: DSSitem[chunkNumber].DCT
    }).then(ypsilonData => {
      handleYpsilonResponse(ypsilonData, currentFlight, direction, chunkNumber, transferCityPoint, DSSitem)
      resolve()
    })
  })
}

const handleYpsilonResponse = (ypsilonData, currentFlight, direction, chunkNumber, transferCityPoint, DSSitem) => {
  if (ypsilonData && ypsilonData.statusCode === 200 && ypsilonData.body && ypsilonData.body.tarifs) {
    let itinList = []

    if (ypsilonData.body.tarifs.length) {
      ypsilonData.body.tarifs.forEach(el => {
        if (el.outbound.flights.length > 1) {
          el.outbound.flights.forEach(flight => {
            itinList.push(itinParser.getYpsilonItin(el, DSSitem, chunkNumber, transferCityPoint, flight.segments))
          })
        } else {
          itinList.push(itinParser.getYpsilonItin(el, DSSitem, chunkNumber, transferCityPoint, el.outbound.flights[0].segments))
        }
      })
    }

    currentFlight.directions[direction][`chunk${chunkNumber}list`] = currentFlight.directions[direction][`chunk${chunkNumber}list`].concat(itinList)
    console.log(`success Ypsilon call for ${chunkNumber} ${direction}: ${DSSitem[chunkNumber].OCT} => ${DSSitem[chunkNumber].DCT}, ${itinList.length}`)
  }
}

const getTransfersViaBFM = (currentFlight, direction, chunkNumber, transferCityPoint, DSSitem) => {
  return new Promise(resolve => {
    BFMresource.getBFM({
      DEPLocation: DSSitem[chunkNumber].OCT,
      ARRLocation: DSSitem[chunkNumber].DCT,
      DEPdateTimeLeg1: currentFlight.flightInitQuery.DEPdateTimeLeg1
    }).then(data => {
      handleBFMresponse(data, currentFlight, direction, chunkNumber, transferCityPoint, DSSitem)
      resolve()
    })
  })
}

const handleBFMresponse = (data, currentFlight, direction, chunkNumber, transferCityPoint, DSSitem) => {
  if(data && data.statusCode === 200 && data.body && data.body.OTA_AirLowFareSearchRS && 
    data.body.OTA_AirLowFareSearchRS.PricedItineraries && 
    data.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary) {
    let itinList = data.body.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary
    .map(el => itinParser.getBFMitin(el, DSSitem, chunkNumber, transferCityPoint))

    currentFlight.directions[direction][`chunk${chunkNumber}list`] = currentFlight.directions[direction][`chunk${chunkNumber}list`].concat(itinList)
    console.log(`success BFM call for ${chunkNumber} ${direction}: ${DSSitem[chunkNumber].OCT} => ${DSSitem[chunkNumber].DCT}, ${itinList.length}`)
  }
}

const itineraryViaTransferPoint = {
  get: (currentFlight, DSSdata) => {
    return new Promise(resolve => {
      if (currentFlight.market === 'RU') {
        currentFlight.transferPointList = DSS.getParcedDssRuTransferPoints(DSSdata)
        console.log(currentFlight.transferPointList)
        getItineraryViaTransferPoint(currentFlight, null)
      } else {
        currentFlight.directions = DSS.getParcedDssTransferPoints(DSSdata)
        getItineraryViaTransferPoint(currentFlight, 'LCCtoGDS').then(() => {
          getItineraryViaTransferPoint(currentFlight, 'GDStoLCC').then(() => {
            resolve()
          })
        })
      }

    })
  }
}

module.exports = itineraryViaTransferPoint