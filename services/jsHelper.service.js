const colorCodes = require('./colorCodes.service')
var fs = require('fs');
var easyconvert = require('easyconvert');

const jsHelper = {
  toOneLineString: structure => {
    let oneLineString = '';
    for (let key in structure) {
      oneLineString = oneLineString.concat(key + '=' + structure[key] + '&')
    }
    return oneLineString
  },

  getMMPList: dom => {
    let MMPLIST = Array.prototype.slice.call(dom.window.document.querySelectorAll('table.fieldlist table.fieldlist table.fieldlist'))
    return MMPLIST.filter(el => el.outerHTML.includes('MML') ? el : null)
  },
  
  argumentsValidation: (args, cb) => {
    if (args.length !== 5) {
      console.log(`${colorCodes.BGgreen}${colorCodes.red}
      Wrong amount of arguments.
      Should be 3: origin, destination, date. f.e:
      LON KRK 2018-08-12 ${colorCodes.reset}`);
      cb(true)
    } else {
      cb(false)
    }
  },

  deepMap: (obj, f) => {
    return Object.keys(obj).reduce(function(acc, k) {
      if ({}.toString.call(obj[k]) == '[object Object]') {
        acc[k] = jsHelper.deepMap(obj[k], f)
      } else {
        acc[k] = f(obj[k], k)
      }
      return acc
    },{})
  },

  joinObjects: arrObj => {
    let counter = 0
    return arrObj.reduce((acc, x, index) => {
      if((index) % 6 === 0) {
        counter++
        acc[counter] = {}
      }
  
      for (var key in x) acc[counter][key] = x[key]
      return acc
    }, {})
  },

  logIt: data => {
    fs.writeFile('log.json', JSON.stringify(data), 'utf8', () => {});
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

module.exports = jsHelper