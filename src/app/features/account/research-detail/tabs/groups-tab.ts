import {Component, computed, input, model, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GroupDraft, ParamDraft, SubjectDraft} from '../research-detail.types';

type GroupModal = 'none' | 'editGroup' | 'editSubject';

@Component({
  standalone: true,
  selector: 'rf-groups-tab',
  templateUrl: './groups-tab.html',
  imports: [FormsModule],
})
export class GroupsTab {
  groups = model.required<GroupDraft[]>();
  trackedParameters = input.required<ParamDraft[]>();

  // ── Add group form ──
  newGroupLabel = '';
  newGroupDescription = '';

  // ── Modal state ──
  modal = signal<GroupModal>('none');

  // ── Edit group ──
  editingGroupIndex = signal(-1);
  editGroupLabel = '';
  editGroupDescription = '';

  // ── Edit subject ──
  editingSubjectGroupIndex = signal(-1);
  editingSubjectIndex = signal(-1);
  editSubjectCode = '';
  editSubjectRemarks = '';
  editSubjectKycVerified = false;
  editSubjectParams = signal<{parameterId: string; name: string; unit: string; value: number}[]>([]);
  kycCopied = signal(false);

  totalSubjects = computed(() =>
    this.groups().reduce((sum, g) => sum + g.subjects.length, 0)
  );

  // ════════════ Groups ════════════

  addGroup() {
    const label = this.newGroupLabel.trim();
    if (!label) return;
    this.groups.update(g => [...g, {label, description: this.newGroupDescription.trim(), subjects: []}]);
    this.newGroupLabel = '';
    this.newGroupDescription = '';
  }

  removeGroup(i: number) {
    this.groups.update(g => g.filter((_, idx) => idx !== i));
  }

  openEditGroup(i: number) {
    const g = this.groups()[i];
    this.editingGroupIndex.set(i);
    this.editGroupLabel = g.label;
    this.editGroupDescription = g.description;
    this.modal.set('editGroup');
  }

  saveEditGroup() {
    const i = this.editingGroupIndex();
    this.groups.update(list =>
      list.map((g, idx) => idx === i
        ? {...g, label: this.editGroupLabel.trim() || g.label, description: this.editGroupDescription}
        : g
      )
    );
    this.closeModal();
  }

  // ════════════ Subjects ════════════

  openAddSubject(groupIndex: number) {
    this.editingSubjectGroupIndex.set(groupIndex);
    this.editingSubjectIndex.set(-1);
    this.editSubjectCode = 'SUB-' + String(this.totalSubjects() + 1).padStart(4, '0');
    this.editSubjectRemarks = '';
    this.editSubjectKycVerified = false;
    this.editSubjectParams.set(
      this.trackedParameters().map(p => ({parameterId: '', name: p.name, unit: p.unit, value: 0}))
    );
    this.modal.set('editSubject');
  }

  openEditSubject(groupIndex: number, subjectIndex: number) {
    const s = this.groups()[groupIndex].subjects[subjectIndex];
    this.editingSubjectGroupIndex.set(groupIndex);
    this.editingSubjectIndex.set(subjectIndex);
    this.editSubjectCode = s.code;
    this.editSubjectRemarks = s.remarks;
    this.editSubjectKycVerified = s.kycVerified;
    this.editSubjectParams.set(
      this.trackedParameters().map(p => {
        const existing = s.parameterValues.find(pv => pv.parameterId === p.name);
        return {parameterId: p.name, name: p.name, unit: p.unit, value: existing?.value ?? 0};
      })
    );
    this.modal.set('editSubject');
  }

  saveSubject() {
    const gi = this.editingSubjectGroupIndex();
    const si = this.editingSubjectIndex();
    const draft: SubjectDraft = {
      code: this.editSubjectCode.trim(),
      remarks: this.editSubjectRemarks.trim(),
      kycVerified: this.editSubjectKycVerified,
      parameterValues: this.editSubjectParams().map(p => ({parameterId: p.name, value: p.value})),
    };
    this.groups.update(list =>
      list.map((g, idx) => {
        if (idx !== gi) return g;
        const subjects = [...g.subjects];
        if (si >= 0) {
          subjects[si] = draft;
        } else {
          subjects.push(draft);
        }
        return {...g, subjects};
      })
    );
    this.closeModal();
  }

  removeSubject(groupIndex: number, subjectIndex: number) {
    this.groups.update(list =>
      list.map((g, idx) => idx === groupIndex
        ? {...g, subjects: g.subjects.filter((_, j) => j !== subjectIndex)}
        : g
      )
    );
  }

  updateParamValue(index: number, value: number) {
    this.editSubjectParams.update(list =>
      list.map((p, i) => i === index ? {...p, value} : p)
    );
  }

  copyKycLink() {
    const code = this.editSubjectCode.trim();
    const link = `${window.location.origin}/kyc/${code}`;
    navigator.clipboard.writeText(link);
    this.kycCopied.set(true);
    setTimeout(() => this.kycCopied.set(false), 2000);
  }

  closeModal() {
    this.modal.set('none');
  }
}
