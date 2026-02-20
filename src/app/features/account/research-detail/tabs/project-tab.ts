import {Component, model, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ParamDraft} from '../research-detail.types';

@Component({
  standalone: true,
  selector: 'rf-project-tab',
  templateUrl: './project-tab.html',
  imports: [FormsModule],
})
export class ProjectTab {
  // ── Research basics ──
  title = model('');
  hypothesis = model('');
  description = model('');

  // ── Study protocol ──
  protocolPrimaryOutcome = model('');
  protocolSampleSizeJustification = model('');
  protocolStatisticalMethod = model('');
  protocolRandomizationMethod = model('');
  protocolBlindingDetails = model('');
  protocolInterventionDescription = model('');
  protocolInclusionCriteria = model('');
  protocolExclusionCriteria = model('');
  protocolEarlyStoppingCriteria = model('');

  // ── Primary outcomes ──
  primaryOutcomes = model<string[]>([]);
  newOutcomeText = '';

  // ── Tracked parameters ──
  trackedParameters = model<ParamDraft[]>([]);
  newParamName = '';
  newParamUnit = '';

  // ── Editing mode (for header text) ──
  isEditMode = model(false);

  addOutcome() {
    const text = this.newOutcomeText.trim();
    if (!text) return;
    this.primaryOutcomes.update(list => [...list, text]);
    this.newOutcomeText = '';
  }

  removeOutcome(i: number) {
    this.primaryOutcomes.update(list => list.filter((_, idx) => idx !== i));
  }

  addParam() {
    const name = this.newParamName.trim();
    const unit = this.newParamUnit.trim();
    if (!name || !unit) return;
    this.trackedParameters.update(p => [...p, {name, unit}]);
    this.newParamName = '';
    this.newParamUnit = '';
  }

  removeParam(i: number) {
    this.trackedParameters.update(p => p.filter((_, idx) => idx !== i));
  }
}
