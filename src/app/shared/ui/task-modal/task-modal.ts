import {Component, input, output, signal, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {LogEntry, Artifact, ArtifactType} from '../../../core/models/research.model';

export interface TaskData {
  title: string;
  description: string;
  logEntries: LogEntry[];
  artifacts: Artifact[];
}

@Component({
  standalone: true,
  selector: 'rf-task-modal',
  templateUrl: './task-modal.html',
  imports: [FormsModule, DatePipe],
})
export class TaskModal implements OnInit {
  /** The task to display/edit */
  task = input.required<TaskData>();

  /** Read-only mode — no editing allowed */
  readonly = input(false);

  /** Emitted when user saves changes */
  save = output<TaskData>();

  /** Emitted when user deletes the task */
  delete = output<void>();

  /** Emitted when modal is closed without saving */
  close = output<void>();

  // ── Local editable copies ──
  editTitle = '';
  editDescription = '';
  editLogEntries: LogEntry[] = [];
  editArtifacts: Artifact[] = [];

  // ── UI state ──
  activeTab = signal<'general' | 'logs' | 'artifacts'>('general');
  newLogText = '';
  newArtifactName = '';
  newArtifactType: ArtifactType = 'RAW_DATA';

  artifactTypes: {value: ArtifactType; label: string}[] = [
    {value: 'RAW_DATA', label: 'Raw Data'},
    {value: 'PHOTO', label: 'Photo'},
    {value: 'CODE', label: 'Code'},
    {value: 'CONFIG', label: 'Config'},
    {value: 'ETHICS_APPROVAL', label: 'Ethics Approval'},
    {value: 'LAB_RESULT', label: 'Lab Result'},
  ];

  ngOnInit() {
    const t = this.task();
    this.editTitle = t.title;
    this.editDescription = t.description;
    this.editLogEntries = [...t.logEntries];
    this.editArtifacts = [...t.artifacts];
  }

  // ── Logs ──

  addLog() {
    if (this.readonly()) return;
    const text = this.newLogText.trim();
    if (!text) return;
    this.editLogEntries = [
      ...this.editLogEntries,
      {
        id: crypto.randomUUID(),
        text,
        subjectUpdates: [],
        artifacts: [],
        createdAt: new Date().toISOString(),
      },
    ];
    this.newLogText = '';
  }

  removeLog(index: number) {
    if (this.readonly()) return;
    this.editLogEntries = this.editLogEntries.filter((_, i) => i !== index);
  }

  // ── Artifacts ──

  addArtifact() {
    if (this.readonly()) return;
    const name = this.newArtifactName.trim();
    if (!name) return;
    this.editArtifacts = [
      ...this.editArtifacts,
      {
        id: crypto.randomUUID(),
        type: this.newArtifactType,
        fileName: name,
        storageUrl: '',
        sha256: '',
        metadata: {},
      },
    ];
    this.newArtifactName = '';
    this.newArtifactType = 'RAW_DATA';
  }

  removeArtifact(index: number) {
    if (this.readonly()) return;
    this.editArtifacts = this.editArtifacts.filter((_, i) => i !== index);
  }

  artifactTypeIcon(type: ArtifactType): string {
    const map: Record<ArtifactType, string> = {
      RAW_DATA: '📊',
      PHOTO: '📷',
      CODE: '💻',
      CONFIG: '⚙️',
      ETHICS_APPROVAL: '📜',
      LAB_RESULT: '🧪',
    };
    return map[type];
  }

  // ── Actions ──

  onSave() {
    this.save.emit({
      title: this.editTitle.trim() || this.task().title,
      description: this.editDescription,
      logEntries: this.editLogEntries,
      artifacts: this.editArtifacts,
    });
  }

  onDelete() {
    this.delete.emit();
  }

  onClose() {
    this.close.emit();
  }
}
