import { Component, OnInit, EventEmitter, Output } from '@angular/core'

import { WatsonConversationService } from './watson-conversation.service'
import { WatsonDiscovery } from './discovery.service'

import { ChatMessage } from './message'

@Component({
  selector: 'wsl-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Output() convoResponse: EventEmitter<any> = new EventEmitter()
  @Output() openchat: EventEmitter<boolean> = new EventEmitter<boolean>()

  text: string = ''
  context: any = {}
  convoArray: ChatMessage[] = []
  discoveryArray = []
  discoveryIndex: number = 0
  chatIndex: number = 0
  pending: boolean = false
  resultCount: number

  constructor(private convoService: WatsonConversationService, private discovery: WatsonDiscovery) { }

  ngOnInit() {

    this.postMessage('')
  }

  postMessage(text: string): void  {
    this.pending = false
    if (text !== '') {
      this.convoArray.pop()
      this.convoArray.push(new ChatMessage(text, 'human', this.chatIndex++, 'conversation', null))
      this.scrollToBottomOfChat()
    }
    this.convoService.sendMessage(text, this.context).subscribe(response => {
      if (response[0].output.call_discovery === true) {
        console.log('call discovery')
        const reply = 'let\'s see what we\'ve got...'
        this.convoArray.push(new ChatMessage(reply, 'watson', this.chatIndex++, 'conversation', null))
        this.convoArray.push(new ChatMessage('', 'watson', this.chatIndex++, 'loading', null))
        const convoResponse = response[0].output.text[1]
        this.discovery.query(text).subscribe(data => {
            console.log(data)
            this.convoArray.pop()
            this.discoveryArray = data.passages
            this.resultCount = data.matching_results
            this.convoArray.push(new ChatMessage(this.discoveryArray[this.discoveryIndex].passage_text, 'watson', this.chatIndex++, 'discovery', this.discoveryArray[this.discoveryIndex].passage_score * 10))
            this.convoArray.push(new ChatMessage(convoResponse, 'watson', this.chatIndex++, 'conversation', null))
            setTimeout(() => {
              this.scrollToBottomOfChat()
              this.discoveryIndex ++
            }, 400)
          })
      } else if (response[0].output.credit_card_widget === true) {
        console.log(response[0].output.credit_card_widget)
        this.convoArray.push(new ChatMessage('Please enter your payment info below:', 'watson', this.chatIndex++, 'payment', null))
      } else {
        console.log(response[0])
        response[0].output.text.forEach((line) => {
          this.convoArray.push(new ChatMessage(line, 'watson', this.chatIndex++, 'conversation', null))
        })
      }
      this.context = response[0].context
      this.convoResponse.emit(response)
      setTimeout(() => {
        this.scrollToBottomOfChat()
      }, 400)
    }, error => console.log(error))
  }

  postPending(): void {
    if (this.pending === false) {
      this.pending = true
      this.convoArray.push(new ChatMessage('...', 'human', this.chatIndex++, 'conversation', null))
      setTimeout(() => {
        this.scrollToBottomOfChat()
      }, 100)
    }
  }

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
    this.text = ''
    this.postMessage('')
  }

  showMore() {
    console.log('wants to see more results')
    this.convoArray.pop()
    this.convoArray.push(new ChatMessage(this.discoveryArray[this.discoveryIndex].passage_text, 'watson', this.chatIndex++, 'discovery', this.discoveryArray[this.discoveryIndex].passage_score * 10))
    this.discoveryIndex ++
    this.convoArray.push(new ChatMessage('What else can I help with?', 'watson', this.chatIndex++, 'conversation', null))
    setTimeout(() => {
      this.scrollToBottomOfChat()
    }, 100)
  }

}
