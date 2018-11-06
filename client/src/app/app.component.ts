import { Component } from '@angular/core'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Customer View'

  public constructor(private titleService: Title) {
    this.titleService.setTitle( this.title )
  }

}
