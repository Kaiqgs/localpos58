import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SourcetextComponent } from './sourcetext/sourcetext.component';
import { PreviewComponent } from './preview/preview.component';

@NgModule({
  declarations: [
    AppComponent,
    SourcetextComponent,
    PreviewComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
