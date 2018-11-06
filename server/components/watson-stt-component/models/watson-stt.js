'use strict'

const fs = require('fs')
const formidable = require('formidable')

// Configure the Speech To Text Service with the Credentials
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const speechToText = new SpeechToTextV1({
    username: process.env.WATSON_STT_USERNAME,
    password: process.env.WATSON_STT_PASSWORD,
    url: 'https://stream.watsonplatform.net/speech-to-text/api'
})

const DEFAULT_PARAMS = {
    model: 'en-US_BroadbandModel',
    content_type: 'audio/ogg',
    timestamps: true,
    objectMode: true
}

module.exports = function (WatsonSTT) {

    // WARNING:
    // This function will upload the file, then stream it to STT, which is probably
    // not the most effective way of doing it.  Stream the file directly from the browser
    // to STT or use WebSockets to at least send the results back to the browser as it is
    // reveived here.
    WatsonSTT.transcribeAudio = function (req, res, cb) {
    
        try {
            const uploadDir = __dirname + '/uploads'

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir)
            }
    
            const form = new formidable.IncomingForm()
    
            form.parse(req)

            let params = {}
            
            form.on('field', function(name, value) {
                params[name] = value
            })

            form.on('fileBegin', (name, file) => {
                file.path = uploadDir + '/' + file.name
            })
        
            form.on('file', (name, file) => {

                params = Object.assign(DEFAULT_PARAMS, params)
                var recognizeStream = speechToText.createRecognizeStream(params)
            
                // Stream the audio to STT
                let f = fs.createReadStream(file.path)
                f.pipe(recognizeStream);
            
                // Get strings instead of buffers from 'data' events.
                let buffer = []
                // Listen for events.
                recognizeStream.on('data', (data) => {
                    if (data.results && data.results[0] && data.results[0].final && data.results[0].alternatives) {
                        buffer.push(data)
                    }
                })
                recognizeStream.on('error', (err) => {
                    return cb(err)
                })
                recognizeStream.on('end', (event) => {
                    return cb(null, buffer)
                });
            })
        } catch (err) {
            cb(err)
        }

    }
    
}
