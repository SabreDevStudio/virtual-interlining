const colorCodes = require('./colorCodes.service')

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
  }
}

module.exports = jsHelper