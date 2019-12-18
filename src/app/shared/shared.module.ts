import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SpinnerComponent } from './spinner/spinner.component';
import { PaginateComponent } from './paginate/paginate.component';


@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
  ],
  declarations: [
    SpinnerComponent,
    PaginateComponent
  ],
  exports: [
    SpinnerComponent,
    PaginateComponent
  ]
})
export class SharedModule { }
