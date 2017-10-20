'use strict'

var wdsQueryUtils = require('../utils/wds-query-utils')
var app = require('../../server/server')

module.exports = function (Discovery) {

//Remote method to see collection information and verify discovery is active
  Discovery.getCollectionInfo = function (cb) {
    wdsQueryUtils.getCollectionInfo(function (err, result) {
      cb(err, result)
    })
  }

//Remote method to get news results for a natural language query search
  Discovery.naturalLanguageQuery = function (req, res, cb) {

  //Create query
  let natural_language_query = req.body.text

console.log(req.body)
  //Combine to final parameters for http request
    let params = {
      natural_language_query: natural_language_query,
      passages: true,
      highlight: true,
      count: 10
    }
    wdsQueryUtils.query(params).then((result) => {
      // console.log(result)
      let response = {}
      response.passages = []
      for (let item of result.passages) {
        if (item.passage_text[0] !== item.passage_text[0].toUpperCase()){
          item.passage_text = '...' + item.passage_text
        }
        if (item.passage_text[0] === ' '){
          item.passage_text = '...' + item.passage_text
        }
        if (item.passage_text[0] === ','){
          item.passage_text = item.passage_text.slice(2) + '...' + item.passage_text
        }
        if (item.passage_text[item.passage_text.length - 2] !== '.'){
          item.passage_text = item.passage_text + '...'
        }
        let obj = {
          "passage_text": item.passage_text.replace(/<\/?[^>]+(>|$)/g,''),
          "passage_score": item.passage_score
        }
        response.passages.push(obj)
      }
      response.count = result.matching_results
      cb(null, response)
    }, (err) => cb(err))
  }


}
