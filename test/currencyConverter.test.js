const {toEuro, roundNumber} = require('../services/currencyConverter.service')
const assert = require('assert')

describe('toEuro functionality', () => {
  it('should return 0, when currency was not found', () => {
    assert.strictEqual(toEuro(123, 'CNY'), 0)
  })

  it('should return same amount, when currency is EUR', () => {
    assert.strictEqual(toEuro(123, 'EUR'), 123)
  })

  it('should return 12.59, when currency is NOK and amount is 123 in combination with roundNumber', () => {
    assert.strictEqual(roundNumber(toEuro(123, 'NOK')), 12.59)
  })

  it('should round 12.598786868 amount and return 12.6, when currency is EUR in combination with roundNumber', () => {
    assert.strictEqual(roundNumber(toEuro(12.598786868, 'EUR')), 12.6)
  })
})

describe('roundNumber functionality', () => {
  it('should correctly round 12.2324334543 to 12.23', () => {
    assert.strictEqual(roundNumber(12.2324334543), 12.23)
  })

  it('should correctly round 122324334.543 to 122324334.54', () => {
    assert.strictEqual(roundNumber(122324334.543), 122324334.54)
  })

  it('should correctly round -12.2232 to -12.22', () => {
    assert.strictEqual(roundNumber(-12.2232), -12.22)
  })

  it('should return 0 when nomber is 0', () => {
    assert.strictEqual(roundNumber(0), 0)
  })
})