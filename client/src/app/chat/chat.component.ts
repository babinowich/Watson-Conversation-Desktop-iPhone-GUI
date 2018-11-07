import { Component, OnInit } from '@angular/core'

import { WatsonAssistant } from './shared/services/assistant.service'
import { WatsonDiscovery } from './shared/services/discovery.service'
import { WatsonToneAnalyzer } from './shared/services/tone.service'

import { ChatMessage } from './shared/classes/message'
import { Emotion } from './shared/classes/emotion'
import { Utterance } from './shared/classes/utterance'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

// conversation variables
  text: string = ''
  context: any = {}
  convoArray: ChatMessage[] = []

// discovery variables
  discoveryArray = []
  discoveryIndex: number = 0
  pending: boolean = false
  resultCount: number

// tone variables
  utteranceArray: Utterance[] = []
  emotionsArray: Emotion[] = []

  constructor(
    private assistant: WatsonAssistant,
    private discovery: WatsonDiscovery,
    private tone: WatsonToneAnalyzer
  ) { }

// 1- when the app starts, initialize by sending a blank text submission to Watson
  ngOnInit() {
    this.postMessage('')
  }

// 2- when the user starts typing, the input component sends an event emitter which triggers this method
  postPending(): void {
    if (this.pending === false) {
      this.pending = true
      this.convoArray.push(new ChatMessage('...', 'human', 'conversation'))
      setTimeout(() => {
        this.scrollToBottomOfChat()
      }, 100)
    }
  }

// 3- when user hits enter or submit
  submitPressed(text: string): void  {
    this.processUsertext(text)
    this.postEmotionMessage(text)
  }

  processUsertext(text: string) {
    // remove pending flag
    this.pending = false
    // pop the (...) human placeholder text
    this.convoArray.pop()
    // add the human text to the conversation the chat array
    this.convoArray.push(new ChatMessage(text, 'human', 'conversation'))
    // add the input to the utterance array for ToneAnalyzer
    this.utteranceArray.push(new Utterance(text, 'customer'))
    // add a placeholder while getting responses back to wait for tone and conversation to come back
    this.convoArray.push(new ChatMessage('...', 'watson', 'conversation'))
    setTimeout(() => {
      this.scrollToBottomOfChat()
      // this.scrollToInput()
    }, 100)
  }

  postEmotionMessage(text: string) {
    this.tone.getAnalysis(this.utteranceArray).subscribe(response => {
    // this helps account for the weird tone bug that comes up sometimes (sometimes 500's, will bring back false)
      if (response.status === '500') {
        console.log('Tone 500-ed')
        // still send to conversation, but bypass addition of emotion to the bubble
        this.postMessage(text)
      } else {
        // if tone worked, then continue
        const emotions = response
        console.log(emotions)
        console.log(this.convoArray)
        // append the new emotions analyzed to the context object for next message
        this.context.emotions = emotions
        this.emotionsArray = response
        // find the item in the conversation array that we just got the tone for, and update the tone attributes for that item
        this.convoArray[this.convoArray.length - 2].emotion = emotions.lastPredom
        this.convoArray[this.convoArray.length - 2].score = response.lastPredomConf
        // developer chosen thresholds for emotions - can change depending on use case
        if ((emotions.lastPredom === 'frustrated') || (emotions.lastPredom === 'impolite') && emotions.lastPredomConf > 0.68) {
          console.log('this guy is frustrated')
          this.convoArray[this.convoArray.length - 2].emotionStrong = true
          this.convoArray.pop()
          this.convoArray.push(
            new ChatMessage(
              'I\'m sorry it looks like this conversation isnt going too well. You seem ' + emotions.lastPredom,
              'watson',
              'conversation'
            )
          )
          setTimeout(() => {
            this.scrollToBottomOfChat()
          }, 400)
        } else if (emotions.lastPredom === 'sad' && emotions.lastPredomConf > 0.7) {
          console.log('this guy is sad')
          this.convoArray[this.convoArray.length - 2].emotionStrong = true
          this.convoArray.pop()
          this.convoArray.push(new ChatMessage('Hey cheer up!', 'watson', 'showGif'))
          setTimeout(() => {
            this.scrollToBottomOfChat()
          }, 400)
        } else {
          // if the user has normal emotional levels, proceed to conversation
          this.postMessage(text)
        }
      }
    })
  }

  postMessage(text: string) {
    this.assistant.sendMessage(text, this.context).subscribe(response => {
      console.log(response)
      this.convoArray.pop()
    // if the conversation service has a discovery flag, let's call discovery
      if (response.output.call_discovery === true) {
        console.log('call discovery')
      // add a line indicating we are going to discovery for probabilistic answer
        this.convoArray.push(new ChatMessage('Let\'s see what we\'ve got...', 'watson', 'conversation'))
      // add the loading gear bubble
        this.convoArray.push(new ChatMessage('', 'watson', 'loading'))
        const convoResponse = response.output.text[1]
        this.discovery.query(text).subscribe(data => {
          console.log(data)
          this.convoArray.pop()
          this.discoveryArray = data.results
          this.resultCount = data.matching_results
          const score = this.discoveryArray[this.discoveryIndex].score * 10
          this.convoArray.push(new ChatMessage(this.discoveryArray[this.discoveryIndex].text, 'watson', 'discovery', null, null, score))
          this.convoArray.push(new ChatMessage(convoResponse, 'watson', 'conversation'))
          setTimeout(() => {
            this.scrollToBottomOfChat()
            this.discoveryIndex ++
          }, 400)
        })
    // if the conversation service has a credit card widget flag, let's call make a special chat bubble with the card payment
      } else if (response.output.credit_card_widget === true) {
      // show credit card widget
        this.convoArray.push(new ChatMessage('Please enter your payment info below:', 'watson', 'payment'))
      } else {
    // if the conversation service had neither discovery now credit card flags, it's a normal Watson response
        console.log(response)
        response.output.text.forEach((line) => {
          this.convoArray.push(new ChatMessage(line, 'watson', 'conversation'))
        })
      }
      this.context = response.context
      setTimeout(() => {
        this.scrollToBottomOfChat()
      }, 400)
    }, error => console.log(error))
  }

// method to completely reset the conversation, setting all context to empty, reposting empty message
  refreshConvo() {
    console.log('refreshing conversation')
    this.context = {}
    this.convoArray = []
    this.discoveryArray = []
    this.discoveryIndex = 0
    this.pending = false
    this.utteranceArray = []
    this.emotionsArray = []
    this.text = ''
    this.postMessage('')
  }

// method to show another Discovery result
  showMore() {
    this.convoArray.pop()
    const score = this.discoveryArray[this.discoveryIndex].score * 10
    this.convoArray.push(new ChatMessage(this.discoveryArray[this.discoveryIndex].text, 'watson', 'discovery', null, null, score))
    this.discoveryIndex ++
    this.convoArray.push(new ChatMessage('What else can I help with?', 'watson', 'conversation'))
    setTimeout(() => {
      this.scrollToBottomOfChat()
    }, 100)
  }

// view control methods
  scrollToBottomOfChat() {
    const container = document.getElementById('scrolling-chat-box')
    container.scrollTop = container.scrollHeight
  }

  scrollToInput() {
    const elmnt = document.getElementById('input_box')
    elmnt.scrollIntoView()
  }

}
