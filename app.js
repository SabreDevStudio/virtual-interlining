const fetch = require('node-fetch')
const RQData = require('./services/requestData.service')
const jsHelper = require('./services/jsHelper.service')
const htmlToJsonParser = require('himalaya').parse
var fs = require('fs')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let oneLinedString = jsHelper.toOneLineString(RQData.body)

fetch('http://utt.cert.sabre.com/utt/dss/sendrequest', {
    method: 'POST',
    body: oneLinedString,
    headers: RQData.getheaders(oneLinedString.length)
})
    .then(res => res.text())
    .then(html => {
      let dom = new JSDOM(html);
      let MMPLIST = Array.prototype.slice.call(dom.window.document.querySelectorAll('table.fieldlist table.fieldlist table.fieldlist'))
      let filteredList = MMPLIST.filter(el => {
        if (el.outerHTML.includes('MML')) {
          return el
        }
      })
      console.log('====================================');
      // console.log(filteredList[15].outerHTML);
      console.log(filteredList.length);
      console.log('====================================');

      
      // fs.writeFile('log.json', JSON.stringify(body), 'utf8', function (err) {
      //   if (err) throw err;
      //   console.log('Saved!');
      // });
    })
    