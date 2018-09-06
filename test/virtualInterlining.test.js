const processVirtualInterlinig = require('../services/virtualInterlining.service')
const BFMresource = require('../services/BFM/bfm.resource.service')
const DSSresource = require('../services/DSS/dss.resource.service')
const DSS = require('../services/DSS/dss.service')
const BFM = require('../services/BFM/bfm.service')
const ypsilonResource = require('../services/ypsilon/ypsilon.resource.service')
const itinParser = require('../services/itin.parser')
const assert = require('assert')
const expect = require('chai').expect

describe('VIRTUAL INTELINING MAIN FLOW', () => {
  let result = []
  let allFlights = [{ DEPLocation: 'LON',
    ARRLocation: 'BKK',
    DEPdateTimeLeg1: '2018-11-05T00:00:00',
    DEPdateTimeLeg2: null
  }]

  before(async () => {
    await processVirtualInterlinig(allFlights, BFMresource, DSSresource, DSS, BFM, 'GB', ypsilonResource, itinParser, (listOfFlights) => {
      result = result.concat(listOfFlights)
    })
  })

  it('should check the length of initial and resulted array', () => {
    assert.strictEqual(result.length, 1)
  })

  it('should check that init and query object are the same', () => {
    expect(result[0].flightInitQuery).to.eql(allFlights[0])
  })

  it('should check GDStoLCC and LCCtoGDS transfer cities', () => {
    if(result[0] && result[0].directions && result[0].directions.GDStoLCC.result) {
      let transferPointItinA = result[0].directions.GDStoLCC.result.itinA.transferPoint
      let transferPointItinB = result[0].directions.GDStoLCC.result.itinB.transferPoint
      assert.strictEqual(transferPointItinA, transferPointItinB)
    } else if (result[0] && result[0].directions && result[0].directions.LCCtoGDS.result) {
      let transferPointItinA = result[0].directions.LCCtoGDS.result.itinA.transferPoint
      let transferPointItinB = result[0].directions.LCCtoGDS.result.itinB.transferPoint
      assert.strictEqual(transferPointItinA, transferPointItinB)
    }
  })

})