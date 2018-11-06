'use strict'

const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const toneAnalyzer = new ToneAnalyzerV3({
  username: process.env.WATSON_TONE_USERNAME,
  password: process.env.WATSON_TONE_PASSWORD,
  version: '2017-09-21',
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api/'
});

module.exports = function(WatsonTone) {

    WatsonTone.tone = function(msg, cb) {

        if (msg.tone_input && !msg.content_type) {
            msg.content_type = 'application/json'
        }

        toneAnalyzer.tone(msg, (err, resp) => {
            if (err) return cb(err)

            cb(null, resp)
        })

    }

    WatsonTone.toneChat = function(toneChatParams, cb) {
        let utterances = toneChatParams
        return new Promise(function (resolve, reject) {
            try {
              console.log(utterances)
              toneAnalyzer.tone_chat(utterances, (err, data) => {
                if (err) {
                  console.log(err)
                  reject(err)
                } else {
                  let response = {}
                  let highScore = 0
                  let dominantEmotion = 'None'
                  let recent = data.utterances_tone.length
                  if (data.utterances_tone){
                    data.utterances_tone[recent-1].tones.forEach((tone) =>{
                      console.log(tone)
                      if (tone.score > highScore) {
                        dominantEmotion = tone.tone_id
                        highScore = tone.score
                      }
                    })
                  }
      
                  let columns = [
                    ['sad'],
                    ['frustrated'],
                    ['excited'],
                    ['satisfied'],
                    ['impolite'],
                    ['sympathetic'],
                    ['polite']
                  ]
      
                  let utterances = data.utterances_tone
      
      
                  for (let i in utterances ){
                    for (let n in columns){
                      columns[n].push(0)
                    }
                    for (let n in utterances[i].tones){
                      for (let a in columns){
                        if (utterances[i].tones[n].tone_id === columns[a][0]){
                          columns[a].splice(Number(i)+1, 1, utterances[i].tones[n].score)
                        }
                      }
                    }
                  }
      
                  response.lastPredom = dominantEmotion
                  response.lastPredomConf = highScore
                  response.lastUtterance = data.utterances_tone[recent-1]
                  response.columnData = columns
                  response.allAnalysis = data.utterances_tone
      
                  console.log(response)
                  resolve(response)
                }
              })
            } catch (err) {
              console.log(err)
              reject(err)
            }
          })
        
    }

}

function calcAverages(utterances){
    let response = {}
    let sadTones = []
    let frustTones = []
    let satTones = []
    let excTones = []
    let polTones = []
    let impolTones = []
    let sympTones = []
    for (let i in utterances){
      for (let n in utterances[i].tones){
        if (utterances[i].tones[n].tone_name === "sad"){
          sadTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_id === "frustrated"){
          frustTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_id === "satisfied"){
          satTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_id === "excited"){
          excTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_id === "polite"){
          polTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_id === "impolite"){
          impolTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_id== "sympathetic"){
          sympTones.push(utterances[i].tones[n])
        }
      }
    }

    let sadScore = 0
    for (let i in sadTones){
      sadScore += sadTones[i].score
    }
    if(sadScore != 0){
      response.sadAvg = (sadScore/sadTones.length)
    } else {
      response.sadAvg = sadScore
    }

    let frustScore = 0
    for (let i in frustTones){
      frustScore += frustTones[i].score
    }
    if(frustScore != 0){
      response.frustAvg = (frustScore/frustTones.length)
    } else {
      response.frustAvg = frustScore
    }

    let satScore = 0
    for (let i in satTones){
      satScore += satTones[i].score
    }
    if(satScore != 0){
      response.satAvg = (satScore/satTones.length)
    } else {
      response.satAvg = satScore
    }

    let excScore = 0
    for (let i in excTones){
      excScore += excTones[i].score
    }
    if(excScore != 0){
      response.excAvg = (excScore/excTones.length)
    } else {
      response.excAvg = excScore
    }

    let polScore = 0
    for (let i in polTones){
      polScore += polTones[i].score
    }
    if(polScore != 0){
      response.polAvg = (polScore/polTones.length)
    } else {
      response.polAvg = polScore
    }

    let impolScore = 0
    for (let i in impolTones){
      impolScore += impolTones[i].score
    }
    if(impolScore != 0){
      response.impolAvg = (impolScore/impolTones.length)
    } else {
      response.impolAvg = impolScore
    }

    let sympScore = 0
    for (let i in sympTones){
      sympScore += sympTones[i].score
    }
    if(sympScore != 0){
      response.sympAvg = (sympScore/sympTones.length)
    } else {
      response.sympAvg = sympScore
    }
    return response
  }