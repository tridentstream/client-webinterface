import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

import { Tridentstream } from '../tridentstream';


export class Login {
  constructor(
    public url: string = '/',
    public username: string = '',
    public password: string = '',
  ) { }
}


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public model = new Login();
  public loading = false;
  public failed = false;

  public showUrl: boolean = environment.platform != 'embedded';

  constructor(private titleService: Title, private router: Router, private route: ActivatedRoute, private tridentstream: Tridentstream) { }

  ngOnInit() {
    this.model.url = this.tridentstream.defaultServerUrl || this.model.url;
    this.titleService.setTitle('Login');
  }

  doLogin() {
    this.loading = true;
    this.failed = false;

    this.tridentstream.login(this.model.url, this.model.username, this.model.password)
      .subscribe(result => {
        this.loading = false;
        this.tridentstream.defaultServerUrl = this.model.url;

        if (result) {
          this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('next') || '/');
        } else {
          this.failed = true;
        }
    });
  }

}
