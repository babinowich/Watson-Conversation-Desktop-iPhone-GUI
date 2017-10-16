'use strict'

var watson = require('watson-developer-cloud')
var _ = require('lodash')

var discovery = new watson.DiscoveryV1({
  username: process.env.DISCOVERY_USERNAME,
  password: process.env.DISCOVERY_PASSWORD,
  version_date: '2017-09-01'
})

var newsCollection = {
  environment_id: process.env.DISCOVERY_ENV_ID,
  collection_id: process.env.DISCOVERY_COLLECTION_ID
}

var WdsQueryUtils = function () { }


WdsQueryUtils.prototype.getCollectionInfo = function (cb) {
  discovery.getCollection(newsCollection, function (err, data) {
    cb(err, data)
  })
}

WdsQueryUtils.prototype.query = function (params) {
  let newParams = _.merge(params, newsCollection)
  return new Promise(function (resolve, reject) {
    try {
      console.log(newParams)
      discovery.query(newParams, (err, data) => {
        if (err) {
          reject(err)
        } else {
          // console.log(JSON.stringify(data, null, 2));
          resolve(data)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

WdsQueryUtils.prototype.capitalize = function(subject){
  let entity
  let spacePresent = /\s/
  if (spacePresent.test(subject)) {
    let ind = subject.indexOf(' ')
    entity = subject.charAt(0).toUpperCase() + subject.slice(1,ind) + ' ' + subject.charAt(ind + 1).toUpperCase() + subject.slice(ind + 2)
  } else {
    entity = subject.charAt(0).toUpperCase() + subject.slice(1)
  }
  return entity
}

WdsQueryUtils.prototype.oppositeSentiment = function(sentiment){
  if (sentiment === 'positive'){
    return 'negative'
  } else if (sentiment === 'negative'){
    return 'positive'
  } else {
    return 'positive|negative'
  }
}

WdsQueryUtils.prototype.removeAmbigDupes = function(object, disambigs){
  console.log("this is the object")
  console.log(object)
  console.log("this is the disambig")
  console.log(disambigs)
  for (let i in object){
    for (let x in disambigs){
      if (object[i].text === disambigs[x]){
        console.log("SPLICE IT")
        object.splice(Number(i),1)
        break
      }
    }
  }
  console.log("this is the object after splice")
  console.log(object)
  return object
}

module.exports = new WdsQueryUtils()
