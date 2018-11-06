'use strict'

module.exports = async function (app, options) {

    if (!app.models['WatsonAssistant']) await defineWatsonAssistant()

    function defineWatsonAssistant() {
        return new Promise((resolve, reject) => {
            // Create a Model Constructor using the json definition
            const WatsonAssistantConstructor = app.registry.createModel(require('./models/watson-assistant.json'))
            // Create a Model from the Model Constructor
            const watsonAssistant = app.model(WatsonAssistantConstructor, { dataSource: null, public: true })
            // Instantiate the Remote Model implementation
            const watsonAssistantRemote = require('./models/watson-assistant')(watsonAssistant)
    
            resolve(watsonAssistantRemote)
        })
    }
}