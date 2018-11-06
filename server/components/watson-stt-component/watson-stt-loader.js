'use strict'

module.exports = async function (app, options) {

    if (!app.models['WatsonSTT']) await defineWatsonSTT()

    function defineWatsonSTT() {
        return new Promise((resolve, reject) => {
            // Create a Model Constructor using the json definition
            const WatsonSTTConstructor = app.registry.createModel(require('./models/watson-stt.json'))
            // Create a Model from the Model Constructor
            const watsonSTT = app.model(WatsonSTTConstructor, { dataSource: null, public: true })
            // Instantiate the Remote Model implementation
            const watsonSTTRemote = require('./models/watson-stt')(watsonSTT)
    
            resolve(watsonSTTRemote)
        })
    }
}