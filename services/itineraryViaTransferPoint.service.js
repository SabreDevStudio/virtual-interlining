const BFMresource = require('./BFM/bfm.resource.service')
const ypsilonResource = require('./ypsilon/ypsilon.resource.service')
const itinParser = require('./itin.parser')
const DSS = require('./DSS/dss.service')
const PromisePool = require('es6-promise-pool')

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
      date: currentFlight.flightInitQuery.DEPdateTimeLeg1,
      transferCity: el
    }
  })
}

const getNoDirectionalChunksLists = currentFlight => {
  return {
    chunk1List: {source: getChunkList(currentFlight, 1)},
    chunk2List: {source: getChunkList(currentFlight, 2)}
  }
}

const getBfmPromise = (itinList, count) => BFMresource.getBFM({
  DEPLocation: itinList[count-1].DEP, 
  ARRLocation: itinList[count-1].ARR, 
  DEPdateTimeLeg1: itinList[count-1].date, 
  transferCity: itinList[count-1].transferCity
})

const getYpsilonPromise = (itinList, count) => ypsilonResource.getItins({
  depDate: itinList[count-1].date.split('T')[0], 
  depCity: itinList[count-1].DEP, 
  dstCity: itinList[count-1].ARR, 
  transferCity: itinList[count-1].transferCity
})

const getNoDirectionalItins = (apiName, currentFlight, chunkNumber) => {
  let count = 0, concurrency = 2, noDirectionalItins = []

  let itinList = currentFlight.noDirections[`chunk${chunkNumber}List`].source
  const bfmPromiseProducer = () => {
    if (count < itinList.length) {
      count++
      if (apiName == 'bfm') {
        return getBfmPromise(itinList, count)
      } else {
        return getYpsilonPromise(itinList, count)
      }
    } else {
      return null
    }
  }

  return new Promise(resolve => {
    let pool = new PromisePool(bfmPromiseProducer, concurrency)
    pool.addEventListener('fulfilled', ev => noDirectionalItins.push(ev.data.result))
    pool.start().then(() => resolve(noDirectionalItins))
  })
}

const getParsedItinList = itinList => {
  let parsedList = []
  let successResponseList = itinList.filter(response => response.statusCode === 200)
  successResponseList.forEach(responseChunk => {
    parsedList = parsedList.concat(itinParser.parseResponseToItinList(responseChunk))
  })

  return parsedList
}

const processNoDirectionalItins = currentFlight => {
  return new Promise(resolve => {
    currentFlight.noDirections = getNoDirectionalChunksLists(currentFlight)
    getNoDirectionalItins('bfm', currentFlight, 1).then(bfmItinList1 => {
      currentFlight.noDirections.chunk1List.result = getParsedItinList(bfmItinList1)
      return getNoDirectionalItins('ypsilon', currentFlight, 1)
    })
    .then(ypsilonItinList1 => {
      currentFlight.noDirections.chunk1List.result = currentFlight.noDirections.chunk1List.result.concat(getParsedItinList(ypsilonItinList1))
      return getNoDirectionalItins('bfm', currentFlight, 2)
    })
    .then(bfmItinList2 => {
      currentFlight.noDirections.chunk2List.result = getParsedItinList(bfmItinList2)
      return getNoDirectionalItins('ypsilon', currentFlight, 2)
    }).then(ypsilonItinList2 => {
      currentFlight.noDirections.chunk2List.result = currentFlight.noDirections.chunk2List.result.concat(getParsedItinList(ypsilonItinList2))
      resolve()
    })
  })
}

const getItineraryViaTransferPoint = async function (currentFlight, direction) {
  if (!direction && currentFlight.transferPointList) {
    await processNoDirectionalItins(currentFlight)
  } else if (direction && currentFlight.directions[direction].source.length) {
    currentFlight.directions[direction].source = getFiltereDirectionsByUniqueTransferPoint(currentFlight, direction)

    let TransferPointPromisesChunk1 = chooseBetwinPromisesApis(currentFlight, direction, 1, 'DCT')//DCT - destination city || arrival of chunk1
    let TransferPointPromisesChunk2 = chooseBetwinPromisesApis(currentFlight, direction, 2, 'OCT')//OCT - origin city || departure of chunk2

    await Promise.all(TransferPointPromisesChunk1.concat(TransferPointPromisesChunk2))
  }
}

const chooseBetwinPromisesApis = (currentFlight, direction, chunkNumber, transferCityPoint) => {
  return currentFlight.directions[direction].source.map(DSSitem => {
    let transferCity = DSSitem[chunkNumber][transferCityPoint]
    if (DSSitem[chunkNumber].LCC === 'true') {
      return getTransfersViaYpsilon(currentFlight, direction, chunkNumber, transferCity, DSSitem)
    } else {
      return getTransfersViaBFM(currentFlight, direction, chunkNumber, transferCity, DSSitem)
    }
  })
}

const getTransfersViaYpsilon = (currentFlight, direction, chunkNumber, transferCity, DSSitem) => {
  return new Promise(resolve => {
    ypsilonResource.getItins({
      depDate: currentFlight.flightInitQuery.DEPdateTimeLeg1.split('T')[0],
      depCity: DSSitem[chunkNumber].OCT,
      dstCity: DSSitem[chunkNumber].DCT,
      transferCity: transferCity
    }).then(ypsilonData => {
      handleYpsilonResponse(ypsilonData, currentFlight, direction, chunkNumber)
      resolve()
    })
  })
}

const handleYpsilonResponse = (ypsilonData, currentFlight, direction, chunkNumber) => {
  let itinList = itinParser.parseResponseToItinList(ypsilonData)
  currentFlight.directions[direction][`chunk${chunkNumber}list`] = currentFlight.directions[direction][`chunk${chunkNumber}list`].concat(itinList)
}

const getTransfersViaBFM = (currentFlight, direction, chunkNumber, transferCity, DSSitem) => {
  return new Promise(resolve => {
    BFMresource.getBFM({
      DEPLocation: DSSitem[chunkNumber].OCT,
      ARRLocation: DSSitem[chunkNumber].DCT,
      DEPdateTimeLeg1: currentFlight.flightInitQuery.DEPdateTimeLeg1,
      transferCity: transferCity
    }).then(data => {
      handleBFMresponse(data, currentFlight, direction, chunkNumber)
      resolve()
    })
  })
}

const handleBFMresponse = (data, currentFlight, direction, chunkNumber) => {
  let itinList = itinParser.parseResponseToItinList(data)
  currentFlight.directions[direction][`chunk${chunkNumber}list`] = currentFlight.directions[direction][`chunk${chunkNumber}list`].concat(itinList)
}

const itineraryViaTransferPoint = {
  get: (currentFlight, DSSdata) => {
    return new Promise(resolve => {
      if (currentFlight.market === 'RU' || currentFlight.market === 'US') {
        currentFlight.transferPointList = DSS.getParcedDssRuTransferPoints(DSSdata)
        console.log(currentFlight.transferPointList)
        getItineraryViaTransferPoint(currentFlight, null).then(() => resolve())
      } else {
        currentFlight.directions = DSS.getParcedDssTransferPoints(DSSdata)
        getItineraryViaTransferPoint(currentFlight, 'LCCtoGDS').then(() => {
          getItineraryViaTransferPoint(currentFlight, 'GDStoLCC').then(() => resolve())
        })
      }
    })
  }
}

module.exports = itineraryViaTransferPoint