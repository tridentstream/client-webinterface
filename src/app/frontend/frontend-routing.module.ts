import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { SectionsComponent } from './sections/sections.component';
import { StoreComponent } from './store/store.component';
import { SettingsComponent } from './settings/settings.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'sections/:sectionsId',
        children: [ // Stairs of retard
          { path: ':folderId1', component: SectionsComponent },
          { path: ':folderId1/:folderId2', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7/:folderId8', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7/:folderId8/:folderId9', component: SectionsComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7/:folderId8/:folderId9/:folderId10', component: SectionsComponent },
        ]
      },
      {
        path: 'store/:sectionsId',
        children: [ // Stairs of retard
          { path: ':folderId1', component: StoreComponent },
          { path: ':folderId1/:folderId2', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7/:folderId8', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7/:folderId8/:folderId9', component: StoreComponent },
          { path: ':folderId1/:folderId2/:folderId3/:folderId4/:folderId5/:folderId6/:folderId7/:folderId8/:folderId9/:folderId10', component: StoreComponent },
        ]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontendRoutingModule { }
