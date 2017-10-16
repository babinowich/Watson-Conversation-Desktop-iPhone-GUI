'use strict'
var api = require('../../server/utils/api')
var app = require('../../server/server')
var watson = require('watson-developer-cloud')

var tone_analyzer = new watson.ToneAnalyzerV3({
  username: process.env.TONE_API_USER,
  password: process.env.TONE_API_PASSWORD,
  version_date: '2016-05-19'
})

module.exports = function(ToneAnalyzer) {

  ToneAnalyzer.getTone = function (req, res, cb){
    let utterances = req.body
    return new Promise(function (resolve, reject) {
      try {
        console.log(utterances)
        tone_analyzer.tone_chat(utterances, (err, data) => {
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
                if (tone.score > highScore) {
                  dominantEmotion = tone.tone_name
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
                  if (utterances[i].tones[n].tone_name === columns[a][0]){
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

var calcAverages = function(utterances){
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
        } else if (utterances[i].tones[n].tone_name === "frustrated"){
          frustTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_name === "satisfied"){
          satTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_name === "excited"){
          excTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_name === "polite"){
          polTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_name === "impolite"){
          impolTones.push(utterances[i].tones[n])
        } else if (utterances[i].tones[n].tone_name === "sympathetic"){
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
}
