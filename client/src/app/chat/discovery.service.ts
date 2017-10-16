import { Injectable, EventEmitter } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import 'rxjs/Rx'
import { Observable } from 'rxjs/Rx'

import { LoopbackLoginService } from '../auth/loopback/lb-login.service'

@Injectable()
export class WatsonDiscovery {
  private accessToken: string
  private url: string = '/api/discovery/naturalLanguageQuery'

  constructor(private http: Http, private auth: LoopbackLoginService) {
    this.accessToken = auth.get().token
    this.url = this.url + '?access_token=' + this.accessToken
  }

    query(text) {
      console.log('discovery service reporting')
      console.log(text)
      const query = {
        text: text
      }
      return this.http.post(this.url, query)
        .map((res: Response) => res.json())
    }

}
