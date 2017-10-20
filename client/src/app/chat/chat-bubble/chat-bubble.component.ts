import {
  EventEmitter,
  Output,
  Component,
  Input,
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes } from '@angular/core'

import { ChatMessage } from '../classes/message'

@Component({
  selector: 'wsl-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.css'],
  animations: [
    trigger('flyIn', [
      state('watson', style({transform: 'translateX(0)'})),
      transition('void => watson', [
        animate(500, keyframes([
          style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
          style({opacity: 1, transform: 'translateX(15px)',  offset: 0.3}),
          style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
        ]))
      ]),
      state('human', style({transform: 'translateX(0)'})),
      transition('void => human', [
        animate(500, keyframes([
          style({opacity: 0, transform: 'translateX(100%)', offset: 0}),
          style({opacity: 1, transform: 'translateX(-15px)',  offset: 0.3}),
          style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
        ]))
      ])
    ]),
  ]
})
export class ChatBubbleComponent {
  @Input() message: ChatMessage
  @Output() moreResults: EventEmitter<boolean> = new EventEmitter <boolean>()
  canTrigger: boolean = true

  nextResult() {
    if (this.canTrigger) {
      this.moreResults.emit(true)
      this.canTrigger = false
    }
  }

}
