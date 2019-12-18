import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ToastrModule } from 'ngx-toastr';
import { TooltipModule, ModalModule } from 'ngx-bootstrap';
import { NgxToggleModule } from "ngx-toggle";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faTrash, faArrowUp, faArrowDown);

import { SharedModule } from '../shared/shared.module';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PluginsComponent } from './plugins/plugins.component';
import { SimpleAdminPluginComponent } from './plugins/plugins.simpleadmin.plugin.component';
import { PluginSectionHeaderComponent } from './plugins/plugins.sectionheader.component';
import { PluginCommandsComponent } from './plugins/plugins.commands.component';
import { UsersComponent } from './users/users.component';
import { JsonschemaComponent } from './jsonschema/jsonschema.component';
import { ConfigsComponent } from './configs/configs.component';
import { AdvancedPluginsComponent } from './advancedplugins/advancedplugins.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    NgxToggleModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      closeButton: true,
      positionClass: 'toast-bottom-right',
      newestOnTop: false
    }),
    FontAwesomeModule,
    SharedModule,
    AdminRoutingModule,
  ],
  declarations: [
    DashboardComponent,
    DefaultLayoutComponent,
    NavbarComponent,
    PluginsComponent,
    SimpleAdminPluginComponent,
    PluginCommandsComponent,
    UsersComponent,
    JsonschemaComponent,
    ConfigsComponent,
    PluginSectionHeaderComponent,
    AdvancedPluginsComponent,
  ]
})
export class AdminModule { }
