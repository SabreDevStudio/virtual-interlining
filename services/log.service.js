const getItinsTotalPrice = (direction, currentFlight) => {
  let result = currentFlight.directions[direction].result
  return result ? `${result.summarizedPrice} via ${result.itinA.transferPoint}` : 'no data'
}

module.exports = (csvStream, currentFlight) => {
  csvStream.write({
    DEP: currentFlight.flightInitQuery.DEPLocation,
    ARR: currentFlight.flightInitQuery.ARRLocation,
    DEPtime: currentFlight.flightInitQuery.DEPdateTimeLeg1,
    GDS: currentFlight.GDS,
    LCCtoGDS: getItinsTotalPrice('LCCtoGDS', currentFlight),
    GDStoLCC: getItinsTotalPrice('GDStoLCC', currentFlight)
  });
}