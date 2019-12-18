import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Tridentstream } from '../tridentstream';

@Component({
  template: '',
  selector: 'app-logout',
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, private tridentstream: Tridentstream) { }

  ngOnInit() {
    this.tridentstream.logout().subscribe(() => {
      this.router.navigate(['login']);
      window.location.reload();
    });
  }

}
