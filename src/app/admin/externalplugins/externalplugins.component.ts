import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap';

import { zip, of, interval } from 'rxjs';
import { flatMap, tap, catchError, map } from 'rxjs/operators';

import { get } from '../../tridentstream/helpers';

import {
  Tridentstream,
  AdminServiceResourceObject,
  ExternalPluginResourceObject,
  LoadedPluginResourceObject,
} from '../../tridentstream';

@Component({
  selector: 'app-externalplugins',
  templateUrl: './externalplugins.component.html',
  styleUrls: ['./externalplugins.component.css']
})
export class ExternalpluginsComponent implements OnInit {
  @ViewChild('restartingModal') public restartingModal: ModalDirective;

  public loading: boolean = false;
  public uploadingPlugins = false;
  public iconUploading = faSpinner;
  public countAttempt = 0;

  public externalPlugins: Array<ExternalPluginResourceObject>;
  public loadedPlugins: Array<LoadedPluginResourceObject>;

  private adminService: AdminServiceResourceObject;

  constructor(public toastr: ToastrService, public titleService: Title, private tridentstream: Tridentstream, private http: HttpClient) { }

  ngOnInit() {
    this.titleService.setTitle('External Plugins - Admin - Tridentstream');
    this.adminService = <AdminServiceResourceObject>this.tridentstream.api.getOfType('service_admin');
    if (!this.adminService) {
      return;
    }

    this.reloadPlugins();
  }

  reloadPlugins() {
    this.loading = true;
    zip(
      this.adminService.getExternalPlugins().pipe(
        map((plugins) => this.externalPlugins = plugins)
      ),
      this.adminService.getLoadedPlugins().pipe(
        map((plugins) => this.loadedPlugins = plugins)
      )
    ).subscribe(() => this.loading = false)
  }

  restartServer() {
    this.adminService.restart_server().pipe(
      tap(() => this.toastr.success('Server restart triggered'))
    ).subscribe(() => {
      this.restartingModal.show();
      let sub = interval(1000).subscribe((n) => {
        get(this.http, this.adminService.links['self']).subscribe(
          () => {
            this.restartingModal.hide();
            sub.unsubscribe();
            this.reloadPlugins();
          },
          (err) => {
            this.countAttempt = n;
          }
        )
      })
    });
  }

  uploadPlugin(file: File) {
    let formData = new FormData();
    formData.set('file', file, file.name);
    return this.adminService.getUrl('admin_externalplugin', 'externalplugin').pipe(
      flatMap((url) => this.http.post(url, formData, { 'withCredentials': true }))
    );
  }

  uploadPlugins($event) {
    this.uploadingPlugins = true;
    let obs = [];
    for (let file of $event.target.files) {
      obs.push(this.uploadPlugin(file).pipe(
        tap(() => this.toastr.success(`Uploaded ${ file.name } successfully`)),
        catchError(() => { this.toastr.error(`Failed to upload ${ file.name }`); return of(null) })
      ));
    }
    zip(...obs).pipe(
      tap(() => this.uploadingPlugins = false)
    ).subscribe((r) => this.reloadPlugins());
  }

  enableExternalPlugin(plugin: ExternalPluginResourceObject) {
    this.loading = true;
    plugin.install().pipe(
      tap(() => this.toastr.success('Plugin uninstalled')),
      catchError(() => {
        this.toastr.error('Failed to uninstall plugin');
        return of(null);
      }),
    ).subscribe(() => this.reloadPlugins())
  }

  deleteExternalPlugin(plugin: ExternalPluginResourceObject) {
    this.loading = true;
    plugin.delete().pipe(
      tap(() => this.toastr.success('Plugin deleted')),
      catchError(() => {
        this.toastr.error('Failed to delete plugin');
        return of(null);
      }),
    ).subscribe(() => this.reloadPlugins())
  }

  uninstallLoadedPlugin(plugin: LoadedPluginResourceObject) {
    console.log(plugin);
    this.loading = true;
    plugin.uninstall().pipe(
      tap(() => this.toastr.success('Plugin uninstalled')),
      catchError(() => {
        this.toastr.error('Failed to uninstall plugin');
        return of(null);
      }),
    ).subscribe(() => this.reloadPlugins())
  }

}
