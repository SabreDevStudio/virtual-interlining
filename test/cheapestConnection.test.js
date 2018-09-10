const rewire = require("rewire")
const cheapestConnection = rewire("../services/cheapestConnection.service")
const assert = require('assert')
const getMilisecondsInSetedHours_private = cheapestConnection.__get__('getMilisecondsInSetedHours')
const isDatesHaveEnoughTimeForTransfer_private = cheapestConnection.__get__('isDatesHaveEnoughTimeForTransfer')

describe('CHEAPESTCONNECTION SERVICE FUNCTIONALITY', () => {
  describe('getMilisecondsInSetedHours private function', () => {
    it('should return 3600000 when seted hours is 1', () => {
      assert.strictEqual(getMilisecondsInSetedHours_private(1), 3600000)
    })
    it('should return 7200000 when seted hours is 2', () => {
      assert.strictEqual(getMilisecondsInSetedHours_private(2), 7200000)
    })
  })

  describe('isDatesHaveEnoughTimeForTransfer private function, return true if betwin date1 and date2 is from 2 to 6 hours', () => {
    it('should return true with 3 hour diff', () => {
      let date1 = '2018-08-13T00:00:00'
      let date2 = '2018-08-13T03:00:00'
      assert.strictEqual(isDatesHaveEnoughTimeForTransfer_private(date1, date2), true)
    })
    it('should return true with 2 hour diff', () => {
      let date1 = '2018-08-13T00:01:00'
      let date2 = '2018-08-13T02:02:00'
      assert.strictEqual(isDatesHaveEnoughTimeForTransfer_private(date1, date2), true)
    })
    
    it('should return false with 1h59min diff', () => {
      let date1 = '2018-08-13T07:00:00'
      let date2 = '2018-08-13T08:59:00'
      assert.strictEqual(isDatesHaveEnoughTimeForTransfer_private(date1, date2), false)
    })
    it('should return true with 5h59min diff', () => {
      let date1 = '2018-08-13T00:00:00'
      let date2 = '2018-08-13T05:59:00'
      assert.strictEqual(isDatesHaveEnoughTimeForTransfer_private(date1, date2), true)
    })
    it('should return false with 6h1min diff', () => {
      let date1 = '2018-08-13T00:00:00'
      let date2 = '2018-08-13T06:01:00'
      assert.strictEqual(isDatesHaveEnoughTimeForTransfer_private(date1, date2), false)
    })
  })
})