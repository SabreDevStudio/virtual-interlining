const getItinsTotalPrice = (direction, currentFlight) => {
  let result = currentFlight.directions[direction].result
  return result ? result.summarizedPrice : false
}

const isCheaper = currentFlight => {
  let GDSprice = currentFlight.GDS
  let LCCtoGDS_price = getItinsTotalPrice('LCCtoGDS', currentFlight)
  let GDStoLCC_price = getItinsTotalPrice('GDStoLCC', currentFlight)

  if (!GDSprice) return false
  if (GDSprice && LCCtoGDS_price && !GDStoLCC_price) return LCCtoGDS_price < GDSprice
  if (GDSprice && !LCCtoGDS_price && GDStoLCC_price) return GDStoLCC_price < GDSprice
  if (GDSprice && LCCtoGDS_price && GDStoLCC_price) return GDStoLCC_price < GDSprice && LCCtoGDS_price < GDSprice
}

const getViaPoint = (direction, currentFlight) => {
  let result = currentFlight.directions[direction].result
  return result ? result.itinA.transferPoint : 'no data'
}

module.exports = (csvStream, currentFlight) => {
  csvStream.write({
    market: currentFlight.market,
    DEP: currentFlight.flightInitQuery.DEPLocation,
    ARR: currentFlight.flightInitQuery.ARRLocation,
    DEPtime: currentFlight.flightInitQuery.DEPdateTimeLeg1,
    GDS: currentFlight.GDS,
    LCCtoGDS_price: getItinsTotalPrice('LCCtoGDS', currentFlight) || 'no data',
    LCCtoGDS_via: getViaPoint('LCCtoGDS', currentFlight),
    GDStoLCC_price: getItinsTotalPrice('GDStoLCC', currentFlight) || 'no data',
    GDStoLCC_via: getViaPoint('GDStoLCC', currentFlight),
    isCheaper: isCheaper(currentFlight)//true when cheaper than GDS
  });
}