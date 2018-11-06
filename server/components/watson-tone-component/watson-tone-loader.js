'use strict'

module.exports = async function (app, options) {

    if (!app.models['WatsonTone']) await defineWatsonTone()

    function defineWatsonTone() {
        return new Promise((resolve, reject) => {
            // Create a Model Constructor using the json definition
            const WatsonToneConstructor = app.registry.createModel(require('./models/watson-tone.json'))
            // Create a Model from the Model Constructor
            const watsonTone = app.model(WatsonToneConstructor, { dataSource: null, public: true })
            // Instantiate the Remote Model implementation
            const watsonToneRemote = require('./models/watson-tone')(watsonTone)
    
            resolve(watsonToneRemote)
        })
    }
}