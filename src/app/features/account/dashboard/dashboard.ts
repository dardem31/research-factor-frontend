import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ResearchService} from '../../../core/services/research.service';

@Component({
  standalone: true,
  templateUrl: './dashboard.html',
  imports: [RouterLink, DatePipe],
})
export default class DashboardPage {
  research = inject(ResearchService);

  delete(id: string) {
    if (confirm('Удалить проект?')) {
      this.research.deleteResearch(id);
    }
  }
}
