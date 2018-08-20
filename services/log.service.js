module.exports = (csvStream, currentFlight) => {
  let LCCtoGDSdirectionsResult = currentFlight.directions.LCCtoGDS.result
  let GDStoLCCdirectionsResult = currentFlight.directions.GDStoLCC.result
  
  let LCCtoGDS = LCCtoGDSdirectionsResult && LCCtoGDSdirectionsResult.itinAprice && LCCtoGDSdirectionsResult.itinBprice ?
  LCCtoGDSdirectionsResult.itinAprice + LCCtoGDSdirectionsResult.itinBprice : 'no data'

  let GDStoLCC = GDStoLCCdirectionsResult && GDStoLCCdirectionsResult.itinAprice && GDStoLCCdirectionsResult.itinBprice ?
  GDStoLCCdirectionsResult.itinAprice + GDStoLCCdirectionsResult.itinBprice : 'no data'

  csvStream.write({
    DEP: currentFlight.flightInitQuery.DEPLocation,
    ARR: currentFlight.flightInitQuery.ARRLocation,
    DEPtime: currentFlight.flightInitQuery.DEPdateTimeLeg1,
    GDS: currentFlight.GDS,
    LCCtoGDS: LCCtoGDS,
    GDStoLCC: GDStoLCC
  });
}