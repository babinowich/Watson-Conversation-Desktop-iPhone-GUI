import { Injectable, EventEmitter } from '@angular/core'
import { Response, Headers } from '@angular/http'

import { catchError, retry, tap, map } from 'rxjs/operators'
import { throwError as observableThrowError,  Observable, throwError } from 'rxjs'

import { LoopbackAuthService } from '../../../auth/loopback/loopback-auth.service'

@Injectable()
export class WatsonToneAnalyzer {
  private toneUrl: string = '/api/WatsonTone/toneChat'

  constructor(private auth: LoopbackAuthService) {
  }

  getAnalysis(utterances): Observable<any> {
    console.log(utterances)
    const body: any = {
      utterances
    }
    return this.auth.httpPostRaw(this.toneUrl, body)
  }

}
