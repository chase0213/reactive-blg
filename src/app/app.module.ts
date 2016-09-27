import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// angular2-material
import { MdUniqueSelectionDispatcher } from '@angular2-material/core';
import { MdInputModule } from '@angular2-material/input';
import { MdButtonModule } from '@angular2-material/button';
import { MdRadioModule } from '@angular2-material/radio';
import { MdCheckboxModule } from '@angular2-material/checkbox';

import { DataService } from './data.service';

import { AppComponent } from './app.component';
import { ReactiveViewComponent } from './reactive-view/reactive-view.component';

@NgModule({
  declarations: [
    AppComponent,
    ReactiveViewComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    MdInputModule,
    MdButtonModule,
    MdRadioModule,
    MdCheckboxModule
  ],
  providers: [
    MdUniqueSelectionDispatcher,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
