import { Component, OnInit, EventEmitter, Output } from '@angular/core'

import { WatsonConversation } from './conversation.service'
import { WatsonDiscovery } from './discovery.service'
import { WatsonToneAnalyzer } from './tone-analyzer.service'

import { ChatMessage } from './classes/message'
import { Emotion } from './classes/emotion'
import { Utterance } from './classes/utterance'

@Component({
  selector: 'wsl-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  // @Output() convoResponse: EventEmitter<any> = new EventEmitter()
  @Output() openchat: EventEmitter<boolean> = new EventEmitter<boolean>()

// conversation variables
  text: string = ''
  context: any = {}
  convoArray: ChatMessage[] = []
  chatIndex: number = 0

// discovery variables
  discoveryArray = []
  discoveryIndex: number = 0
  pending: boolean = false
  resultCount: number

// tone variables
  utteranceArray: Utterance[] = []
  emotionsArray: Emotion[] = []
  isAngry: boolean = false
  isSad: boolean = false

  constructor(
    private convoService: WatsonConversation,
    private discoveryService: WatsonDiscovery,
    private toneService: WatsonToneAnalyzer
  ) { }

// 1- when the app starts, initialize by sending a blank text submission to Watson
  ngOnInit() {
    this.postMessage('')
  }

// 2- when the user starts typing, the input component sends an event emitter which triggers this method
  postPending(): void {
    if (this.pending === false) {
      this.pending = true
      this.convoArray.push(
        new ChatMessage(
          '...',
          'human',
          this.chatIndex++,
          null,
          null,
          null,
          null,
          'conversation'
        )
      )
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
    this.convoArray.push(
      new ChatMessage(
        text,
        'human',
        this.chatIndex++,
        null,
        null,
        null,
        null,
        'conversation'
      )
    )
    // add the input to the utterance array for ToneAnalyzer
    this.utteranceArray.push(new Utterance(text, 'customer'))
    // add a placeholder while getting responses back to wait for tone and conversation to come back
    this.convoArray.push(
      new ChatMessage(
        '...',
        'watson',
        this.chatIndex++,
        null,
        null,
        null,
        null,
        'conversation'
      )
    )
    setTimeout(() => {
      this.scrollToBottomOfChat()
      // this.scrollToInput()
    }, 100)
  }

  postEmotionMessage(text: string) {
    this.toneService.getAnalysis(this.utteranceArray).subscribe(response => {
    // this helps account for the weird tone bug that comes up sometimes (sometimes 500's, will bring back false)
      if (response.status === '500') {
        console.log('Tone 500-ed')
        // still send to conversation, but bypass addition of emotion to the bubble
        this.postMessage(text)
      } else {
        // if tone worked, then continue
        const emotions = response
        // append the new emotions analyzed to the context object for next message
        this.context.emotions = emotions
        this.emotionsArray = response
        // find the item in the conversation array that we just got the tone for, and update the tone attributes for that item
        this.convoArray[this.convoArray.length - 2].emotion = response.lastPredom
        this.convoArray[this.convoArray.length - 2].emoConfidence = response.lastPredomConf
        // developer chosen thresholds for emotions - can change depending on use case
        if (emotions.lastPredom === 'frustrated' && emotions.lastPredomConf > 0.68) {
          console.log('this guy is frustrated')
          this.convoArray[this.convoArray.length - 2].emoStrong = true
          this.convoArray.pop()
          this.convoArray.push(
            new ChatMessage(
              'Im sorry it looks like this conversation isnt going too well. ',
              'watson',
              this.chatIndex++,
              null,
              null,
              null,
              null,
              'conversation'
            ))
          setTimeout(() => {
            this.scrollToBottomOfChat()
          }, 400)
        } else if (emotions.lastPredom === 'impolite' && emotions.lastPredomConf > 0.6) {
          console.log('this guy is impolite')
          this.convoArray[this.convoArray.length - 2].emoStrong = true
          this.convoArray.pop()
          this.convoArray.push(
            new ChatMessage(
              'Im sorry it looks like this conversation isnt going too well. ',
              'watson',
              this.chatIndex++,
              null,
              null,
              null,
              null,
              'conversation'
            ))
          setTimeout(() => {
            this.scrollToBottomOfChat()
          }, 400)
        } else if (emotions.lastPredom === 'sad' && emotions.lastPredomConf > 0.7) {
          console.log('this guy is sad')
          this.convoArray[this.convoArray.length - 2].emoStrong = true
          this.convoArray.pop()
          this.convoArray.push(
            new ChatMessage(
              'Hey cheer up!',
              'watson',
              this.chatIndex++,
              null,
              null,
              null,
              null,
              'showGif'))
          this.isSad = false
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
    this.convoService.sendMessage(text, this.context).subscribe(response => {
      this.convoArray.pop()
      // if the conversation service has a discovery flag, let's call discovery
      if (response[0].output.call_discovery === true) {
        console.log('call discovery')
      // add a line indicating we are going to discovery for probabilistic answer
        this.convoArray.push(
          new ChatMessage(
            'Let\'s see what we\'ve got...',
            'watson',
            this.chatIndex++,
            null,
            null,
            null,
            null,
            'conversation'
          )
        )
      // add the loading gear bubble
        this.convoArray.push(
          new ChatMessage(
            '',
            'watson',
            this.chatIndex++,
            null,
            null,
            null,
            null,
            'loading'
          )
        )
        const convoResponse = response[0].output.text[1]
        this.discoveryService.query(text).subscribe(data => {
          console.log(data)
          this.convoArray.pop()
          this.discoveryArray = data.passages
          this.resultCount = data.matching_results
          this.convoArray.push(
            new ChatMessage(
              this.discoveryArray[this.discoveryIndex].passage_text,
              'watson',
              this.chatIndex++,
              null,
              null,
              null,
              this.discoveryArray[this.discoveryIndex].passage_score * 10,
              'discovery'
            )
          )
          this.convoArray.push(
            new ChatMessage(
              convoResponse,
              'watson',
              this.chatIndex++,
              null,
              null,
              null,
              null,
              'conversation'
            )
          )
          setTimeout(() => {
            this.scrollToBottomOfChat()
            this.discoveryIndex ++
          }, 400)
        })
      } else if (response[0].output.credit_card_widget === true) {
        console.log('show credit card widget')
        this.convoArray.push(
          new ChatMessage(
            'Please enter your payment info below:',
            'watson',
            this.chatIndex++,
            null,
            null,
            null,
            null,
            'payment'
          )
        )
      } else {
        console.log(response[0])
        response[0].output.text.forEach((line) => {
          this.convoArray.push(
            new ChatMessage(
              line,
              'watson',
              this.chatIndex++,
              null,
              null,
              null,
              null,
              'conversation'
            )
          )
        })
      }
      this.context = response[0].context
      // this.convoResponse.emit(response)
      setTimeout(() => {
        this.scrollToBottomOfChat()
      }, 400)
    }, error => console.log(error))
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

  refreshConvo() {
    console.log('refreshing conversation')
    this.context = {}
    this.convoArray = []
    this.discoveryArray = []
    this.discoveryIndex = 0
    this.chatIndex = 0
    this.pending = false
    this.utteranceArray = []
    this.emotionsArray = []
    this.isAngry = false
    this.isSad = false
    this.text = ''
    this.postMessage('')
  }

  showMore() {
    console.log('wants to see more results')
    this.convoArray.pop()
    this.convoArray.push(
      new ChatMessage(
        this.discoveryArray[this.discoveryIndex].passage_text,
        'watson',
        this.chatIndex++,
        null,
        null,
        null,
        this.discoveryArray[this.discoveryIndex].passage_score * 10,
        'discovery'
      )
    )
    this.discoveryIndex ++
    this.convoArray.push(
      new ChatMessage(
        'What else can I help with?',
        'watson',
        this.chatIndex++,
        null,
        null,
        null,
        null,
        'conversation'
      )
    )
    setTimeout(() => {
      this.scrollToBottomOfChat()
    }, 100)
  }

}
