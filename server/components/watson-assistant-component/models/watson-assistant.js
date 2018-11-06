'use strict';

const AssistantV1 = require('watson-developer-cloud/assistant/v1');
const assistant = new AssistantV1({
    username: process.env.ASSISTANT_USERNAME,
    password: process.env.ASSISTANT_PASSWORD,
    url: 'https://gateway.watsonplatform.net/assistant/api/',
    version: '2018-02-16'
})

module.exports = function(WatsonAssistant) {

    WatsonAssistant.message = function(msg, cb) {
        msg.workspace_id = process.env.ASSISTANT_WORKSPACE_ID

        assistant.message(msg, (err, resp) => {
            if (err) return cb(err)

            cb(null, resp)
        })
    }

}
