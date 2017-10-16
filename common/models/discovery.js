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
      cb(null, result)
    }, (err) => cb(err))
  }


}
