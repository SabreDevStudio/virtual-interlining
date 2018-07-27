'use strict'

const fetch = require('node-fetch')

const getBody = () => {
  return {}
}

const getheaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer T1RLAQJsdVISgVfV8wh1bw/fgkPt9GFY1BAkMMPjNPxnTwxCmt3lDjm3AADANnzH54Ro6t/f5XEwnQ48aWL88RoplaCBdTmweXO+SiMtZlp08Ycfi1z7V0tfd+J6rgiX0t8JOCWtcQmZGWeWauX1d3ZpnYwlTzLaxAfngjOaYjiDiVOIEIhmBTxGGk7Y7e5lVu8JDs+0yowBzS8NMv2tLkEWCtjLTP5UzjYhSad7XMQB0XXvPlKKMSH25YNWTbXsHPXx9mzCIVCl3Kcb6Kok31/2D/H4ClkrkX5ndFfPaWc/BHzPtRQckpkEx7WH'
    }
}

const BFMResource = {
  getBFM: cb => {
    fetch('https://api.sabre.com/v4.2.0/shop/flights?mode=live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer T1RLAQJsdVISgVfV8wh1bw/fgkPt9GFY1BAkMMPjNPxnTwxCmt3lDjm3AADANnzH54Ro6t/f5XEwnQ48aWL88RoplaCBdTmweXO+SiMtZlp08Ycfi1z7V0tfd+J6rgiX0t8JOCWtcQmZGWeWauX1d3ZpnYwlTzLaxAfngjOaYjiDiVOIEIhmBTxGGk7Y7e5lVu8JDs+0yowBzS8NMv2tLkEWCtjLTP5UzjYhSad7XMQB0XXvPlKKMSH25YNWTbXsHPXx9mzCIVCl3Kcb6Kok31/2D/H4ClkrkX5ndFfPaWc/BHzPtRQckpkEx7WH'
        },
      body: {}
    }).then(res => {
      if (res.status !== 200) cb(`Status: ${res.status}, ${res.statusText}`)
      return res.text()
    }).then(data => {
        cb(null, data)
      }).catch((error) => {
        cb(error);
      });
  }
}

module.exports = BFMResource