import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';

import { BsDropdownModule, TooltipModule, PaginationModule, ProgressbarModule, ModalModule } from 'ngx-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxToggleModule } from "ngx-toggle";

import { SharedModule } from '../shared/shared.module';

import { FrontendRoutingModule } from './frontend-routing.module';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SectionsComponent } from './sections/sections.component';
import { ListingBoxComponent } from './shared/listingbox/listingbox.component';
import { ListingComponent } from './shared/listing/listing.component';
import { ItemTableComponent, ItemCoverComponent, DurationPipe, ChunkPipe } from './shared/listing/listing.helper.component';
import { StreambuttonComponent } from './shared/streambutton/streambutton.component';
import { FilteringComponent } from './shared/filtering/filtering.component';
import { PlayerComponent, SecondsToTimestampPipe } from './shared/player/player.component';
import { MetadataBoxComponent } from './shared/metadatabox/metadatabox.component';
import { StoreComponent } from './store/store.component';
import { SettingsComponent } from './settings/settings.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FrontendRoutingModule,
    SharedModule,
    FontAwesomeModule,
    NgxToggleModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    ProgressbarModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule
  ],
  declarations: [
    DefaultLayoutComponent,
    NavbarComponent,
    SectionsComponent,
    ListingBoxComponent,
    ListingComponent,
    StreambuttonComponent,
    DurationPipe,
    ChunkPipe,
    ItemTableComponent,
    ItemCoverComponent,
    FilteringComponent,
    PlayerComponent,
    SecondsToTimestampPipe,
    MetadataBoxComponent,
    StoreComponent,
    SettingsComponent,
    HomeComponent,
  ]
})
export class FrontendModule { }
