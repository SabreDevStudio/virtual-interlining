'use strict'

const easyconvert = require('easyconvert')
const jsHelper = require('../jsHelper.service')

const DSS = {
  getMmpList: dom => {
    let MMPLIST = Array.prototype.slice.call(dom.window.document.querySelectorAll('table.fieldlist table.fieldlist table.fieldlist'))
    return MMPLIST.filter(el => el.outerHTML.includes('MML') ? el : null)
  },
  getMmlList: list => {
    let MMLLIST = []
  
    list.forEach(element => {
      let mmlItem = easyconvert.parse(element.outerHTML)
      let mmlTags = []
  
      jsHelper.deepMap(mmlItem, (value, key) => {
        if (key === 'innerHTML' && value !== '\n' && value !== 'MML') {
          mmlTags.push(value.replace(':', ''))
        }
      })
  
      MMLLIST.push(jsHelper.joinObjects(mmlTags.map((el, index) => {
        if (index % 2 === 0) {
          let newObj = {}
          newObj[el] = mmlTags[index += 1]
          return newObj
        }
      }).filter((el) => el ? el : null)))
    })
  
    return MMLLIST
  }
}

module.exports = DSS