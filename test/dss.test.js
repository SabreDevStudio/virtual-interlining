const expect = require('chai').expect
const assert = require('assert')
const dss = require('../services/DSS/dss.service')
const {JSDOM} = require('jsdom')


describe('DSS SERVICE FUNCTIONALITY', () => {
  describe('getParcedDssRuTransferPoints function', () => {
    it('should return empty array when no dom argument', () => {
      expect(dss.getParcedDssRuTransferPoints()).eql([])
    })

    it('should parse html sample and return [KZN,MOW,PEE] array', () => {
      let htmlSample = `<body> <table> <tr> <td colspan="2"> <table> <tr> <td class="title" colspan="2">DSS</td> </tr> <tr> <td rowspan="100" width="20" class="indent-cell"></td> <td> <table class="fieldlist"> <tr> <td class="attrname">VER:</td> <td class="value">2.0</td> </tr> <tr> <td class="attrname">COR:</td> <td class="value">Sabr</td> </tr> <tr> <td class="attrname">MOW:</td> <td class="value">Y</td> </tr> <tr> <td class="attrname">TXN:</td> <td class="value">123</td> </tr> <tr> <td colspan="2" class="value"> </td> </tr> <tr> <td colspan="2"> <table> <tr> <td class="title" colspan="2">CPL</td> </tr> <tr> <td rowspan="100" width="20" class="indent-cell"></td> <td> <table class="fieldlist"> <tr> <td colspan="2"> <table> <tr> <td class="title" colspan="2">CPT</td> </tr> <tr> <td rowspan="100" width="20" class="indent-cell"></td> <td> <table class="fieldlist"> <tr> <td class="attrname">PTH:</td> <td class="value">KZN</td> </tr> </table> </td> </tr> </table> </td> </tr> <tr> <td colspan="2"> <table> <tr> <td class="title" colspan="2">CPT</td> </tr> <tr> <td rowspan="100" width="20" class="indent-cell"></td> <td> <table class="fieldlist"> <tr> <td class="attrname">PTH:</td> <td class="value">MOW</td> </tr> </table> </td> </tr> </table> </td> </tr> <tr> <td colspan="2"> <table> <tr> <td class="title" colspan="2">CPT</td> </tr> <tr> <td rowspan="100" width="20" class="indent-cell"></td> <td> <table class="fieldlist"> <tr> <td class="attrname">PTH:</td> <td class="value">PEE</td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </body>`
      let domElement = new JSDOM(htmlSample)
      let result = ['KZN', 'MOW', 'PEE']
      expect(dss.getParcedDssRuTransferPoints(domElement)).eql(result)
    })
  })
})