import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {InputTextModule, DataTableModule, ButtonModule, DialogModule, SharedModule} from 'primeng/primeng';
import {AppComponent}  from './app.component';

@NgModule({
  imports: [BrowserModule, InputTextModule, DataTableModule, ButtonModule, DialogModule, SharedModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})


export class AppModule {
}
