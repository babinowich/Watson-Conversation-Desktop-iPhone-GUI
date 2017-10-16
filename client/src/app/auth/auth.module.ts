import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'

import { LoopbackLoginComponent } from './loopback/lb-login.component'
import { LoopbackLoginService } from './loopback/lb-login.service'

@NgModule({
  imports:      [ CommonModule, HttpModule, ReactiveFormsModule ],
  declarations: [ LoopbackLoginComponent ],
  providers:    [ LoopbackLoginService ],
  exports:      [ LoopbackLoginComponent ]
})

export class AuthModule {}
