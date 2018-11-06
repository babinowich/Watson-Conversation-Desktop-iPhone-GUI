'use strict'

module.exports = async function (app, options) {

    if (!app.models['WatsonDiscovery']) await defineWatsonDiscovery()

    function defineWatsonDiscovery() {
        return new Promise((resolve, reject) => {
            // Create a Model Constructor using the json definition
            const WatsonDiscoveryConstructor = app.registry.createModel(require('./models/watson-discovery.json'))
            // Create a Model from the Model Constructor
            const watsonDiscovery = app.model(WatsonDiscoveryConstructor, { dataSource: null, public: true })
            // Instantiate the Remote Model implementation
            const watsonDiscoveryRemote = require('./models/watson-discovery')(watsonDiscovery)
    
            resolve(watsonDiscoveryRemote)
        })
    }
}