import { Injectable, EventEmitter } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'
import 'rxjs/Rx'
import { Observable } from 'rxjs/Rx'

import { LoopbackLoginService } from '../auth/loopback/lb-login.service'

@Injectable()
export class WatsonConversation {
  private accessToken: string
  private url: string

  constructor(private http: Http, private auth: LoopbackLoginService) {
    this.accessToken = auth.get().token
    this.url = '/api/Conversation/message?access_token=' + this.accessToken
  }

  sendMessage(message: string, context: any): Observable<any> {
    const body: any = {
      input: {
        text: message
      },
      context
    }
    return this.http.post(this.url, body)
      .map((res: Response) => res.json())
  }

}
