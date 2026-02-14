import {Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'hk-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer {
  currentYear = new Date().getFullYear();
}
