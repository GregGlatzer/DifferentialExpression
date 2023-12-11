import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DiffExpWidgetComponent } from './components/diff-exp-widget/diff-exp-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    DiffExpWidgetComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
