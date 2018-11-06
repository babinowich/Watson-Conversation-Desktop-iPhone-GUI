'use strict'

const DiscoveryV1 = require('watson-developer-cloud/discovery/v1')

const discovery = new DiscoveryV1({
  username: process.env.DISCOVERY_USERNAME,
  password: process.env.DISCOVERY_PASSWORD,
  url: 'https://gateway.watsonplatform.net/discovery/api/',
  version: '2017-09-01'
})

module.exports = function(WatsonDiscovery) {

    WatsonDiscovery.query = function(msg, cb) {

        msg.environment_id = process.env.DISCOVERY_ENVIRONMENT_ID
        msg.collection_id = process.env.DISCOVERY_COLLECTION_ID
        
        discovery.query(msg, (err, resp) => {
            if (err) return cb(err)

            cb(null, resp)
        })
    }

}
