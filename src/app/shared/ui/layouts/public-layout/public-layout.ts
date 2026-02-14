import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

import {Header} from '../../header/header';
import {Footer} from '../../footer/footer';

@Component({
  standalone: true,
  selector: 'hk-public-layout',
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.scss'],
  imports: [RouterOutlet, Header, Footer],
})
export class PublicLayout {}
