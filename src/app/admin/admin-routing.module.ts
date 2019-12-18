import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { PluginsComponent } from './plugins/plugins.component';
import { ConfigsComponent } from './configs/configs.component';
import { AdvancedPluginsComponent } from './advancedplugins/advancedplugins.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'users',
        component: UsersComponent
      },
      {
        path: 'plugins',
        component: PluginsComponent
      },
      {
        path: 'configs',
        component: ConfigsComponent
      },
      {
        path: 'advancedplugins',
        component: AdvancedPluginsComponent
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
