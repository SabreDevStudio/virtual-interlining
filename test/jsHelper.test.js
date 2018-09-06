const expect = require('chai').expect
const assert = require('assert')
const jsHelper = require('../services/jsHelper.service')

describe('JS HELPER FUNCTIONALITY', () => {
  describe('parseDepartureAndArrivalList', () => {
    it('should return correct array', () => {
      let initList = ['FRA-NYC', 'KRK-IEV']
      let resultedList = [{ DEP: 'FRA', ARR: 'NYC' }, { DEP: 'KRK', ARR: 'IEV' }]
      expect(jsHelper.parseDepartureAndArrivalList(initList)).to.eql(resultedList)
    })
  })
  
  describe('getFilteredDate', () => {
    it('should filter 2018-08-13 correctly', () => {
      assert.strictEqual(jsHelper.getFilteredDate(new Date('2018-08-13')), '2018-08-13T00:00:00')
    })

    it('should filter 2019-12-25 correctly', () => {
      assert.strictEqual(jsHelper.getFilteredDate(new Date('2019-12-25')), '2019-12-25T00:00:00')
    })
  })

  describe('getFilteredDateWithTime', () => {
    it('should filter 2018-08-13T10:20 correctly', () => {
      assert.strictEqual(jsHelper.getFilteredDateWithTime(new Date('2018-08-13T10:20')), '2018-08-13T10:20')
    })

    it('should filter 2019-12-25T13:20 correctly', () => {
      assert.strictEqual(jsHelper.getFilteredDateWithTime(new Date('2019-12-25T13:20')), '2019-12-25T13:20')
    })
  })
})