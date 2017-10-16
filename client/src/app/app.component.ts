import { Component } from '@angular/core'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'wsl-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Watson Solutions Lab'

  public constructor(private titleService: Title) {
    this.titleService.setTitle( this.title )
  }

}
