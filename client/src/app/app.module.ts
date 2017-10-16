import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { PathLocationStrategy, LocationStrategy } from '@angular/common'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AuthGuard } from './auth/auth.guard'
import { AuthModule } from './auth/auth.module'
import { AppRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component'
import { PageNotFoundComponent } from './page-not-found/page-not-found.component'
import { ChatModule } from './chat/chat.module'
import { HomeComponent } from './home/home.component'

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    ChatModule,
    AppRoutingModule,
    AuthModule,
    BrowserAnimationsModule
    ],
  providers: [
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
