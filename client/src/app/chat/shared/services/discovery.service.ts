import { Injectable, EventEmitter } from '@angular/core'
import { Response, Headers } from '@angular/http'

import { catchError, retry, tap, map } from 'rxjs/operators'
import { throwError as observableThrowError,  Observable, throwError } from 'rxjs'

import { LoopbackAuthService } from '../../../auth/loopback/loopback-auth.service'

@Injectable()
export class WatsonDiscovery {
  private url: string = '/api/WatsonDiscovery/query'

  constructor(private auth: LoopbackAuthService) {

  }

  query(text) {
    console.log('discovery service reporting')
    console.log(text)
    const query = {
      text: text
    }
    return this.auth.httpPostRaw(this.url, query)
  }

}
