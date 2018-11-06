import { Injectable, EventEmitter } from '@angular/core'
import { Response, Headers } from '@angular/http'

import { catchError, retry, tap, map } from 'rxjs/operators'
import { throwError as observableThrowError,  Observable, throwError } from 'rxjs'

import { LoopbackAuthService } from '../../../auth/loopback/loopback-auth.service'

@Injectable()
export class WatsonAssistant {
  private url: string = '/api/WatsonAssistant/message'

  constructor(private auth: LoopbackAuthService) {
  }

  sendMessage(message: string, context: any): Observable<any> {
    const body: any = {
      input: {
        text: message
      },
      context
    }
    return this.auth.httpPostRaw(this.url, body)
  }

}
