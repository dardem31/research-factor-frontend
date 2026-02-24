import {Component, input, output, signal, computed, OnInit, ElementRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {LogEntry, ParameterChange, SubjectUpdate} from '../../../core/models/research/log-entry.model';
import {Artifact, ArtifactType} from '../../../core/models/research/artifact.model';
import {TaskData} from '../../../core/dtos/task/task-data.dto';
import {MentionableSubject} from '../../../core/dtos/task/mentionable-subject.dto';
import {MentionableArtifact} from '../../../core/dtos/task/mentionable-artifact.dto';
import {TrackedParameterInfo} from '../../../core/dtos/task/tracked-parameter-info.dto';
import {PendingSubjectUpdate} from '../../../core/dtos/task/pending-subject-update.dto';
import {PendingParamEdit} from '../../../core/dtos/task/pending-param-edit.dto';

export type { TaskData, MentionableSubject, MentionableArtifact, TrackedParameterInfo, PendingSubjectUpdate, PendingParamEdit };

interface MentionItem {
  type: 'subject' | 'artifact';
  id: string;
  label: string;
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

  /** Available subjects for @mention (with parameterFields) */
  subjects = input<MentionableSubject[]>([]);

  /** Available artifacts for @mention */
  mentionableArtifacts = input<MentionableArtifact[]>([]);

  /** Tracked parameters (global list with names/units) */
  trackedParameters = input<TrackedParameterInfo[]>([]);

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

  // ── Mention state ──
  mentionOpen = signal(false);
  mentionQuery = signal('');
  mentionIndex = signal(0);
  private mentionStartPos = -1;

  // ── Subject update panel state ──
  pendingSubjectUpdates = signal<PendingSubjectUpdate[]>([]);

  @ViewChild('logInput') logInputRef!: ElementRef<HTMLInputElement>;

  mentionItems = computed<MentionItem[]>(() => {
    const q = this.mentionQuery().toLowerCase();
    const subjectItems: MentionItem[] = this.subjects().map(s => ({type: 'subject', id: s.id, label: s.code}));
    const artifactItems: MentionItem[] = this.mentionableArtifacts().map(a => ({type: 'artifact', id: a.id, label: a.fileName}));
    const all = [...subjectItems, ...artifactItems];
    if (!q) return all;
    return all.filter(item => item.label.toLowerCase().includes(q));
  });

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

  // ── Mention logic ──

  onLogInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const cursorPos = input.selectionStart ?? value.length;

    // Find the last '@' before cursor
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt >= 0) {
      const charBefore = lastAt > 0 ? textBeforeCursor[lastAt - 1] : ' ';
      const query = textBeforeCursor.substring(lastAt + 1);
      // Only open if '@' is preceded by space or start of string, and no space in query
      if ((charBefore === ' ' || lastAt === 0) && !query.includes(' ')) {
        this.mentionStartPos = lastAt;
        this.mentionQuery.set(query);
        this.mentionIndex.set(0);
        this.mentionOpen.set(true);
        return;
      }
    }

    this.closeMention();
  }

  onLogKeydown(event: KeyboardEvent) {
    if (!this.mentionOpen()) return;

    const items = this.mentionItems();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.mentionIndex.update(i => Math.min(i + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.mentionIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && items.length > 0) {
      event.preventDefault();
      this.selectMention(items[this.mentionIndex()]);
    } else if (event.key === 'Escape') {
      this.closeMention();
    }
  }

  selectMention(item: MentionItem) {
    const input = this.logInputRef?.nativeElement;
    const cursorPos = input?.selectionStart ?? this.newLogText.length;
    const before = this.newLogText.substring(0, this.mentionStartPos);
    const after = this.newLogText.substring(cursorPos);
    this.newLogText = before + '@' + item.label + ' ' + after;
    this.closeMention();

    // If a subject was mentioned, add pending update panel
    if (item.type === 'subject') {
      this.addPendingSubjectUpdate(item.id, item.label);
    }

    // Restore focus
    setTimeout(() => {
      if (input) {
        input.focus();
        const pos = before.length + 1 + item.label.length + 1;
        input.setSelectionRange(pos, pos);
      }
    });
  }

  closeMention() {
    this.mentionOpen.set(false);
    this.mentionQuery.set('');
    this.mentionStartPos = -1;
  }

  // ── Subject update panel ──

  private addPendingSubjectUpdate(subjectId: string, subjectCode: string) {
    // Don't duplicate
    if (this.pendingSubjectUpdates().some(p => p.subjectId === subjectId)) return;

    const subject = this.subjects().find(s => s.id === subjectId);
    if (!subject) return;

    const tracked = this.trackedParameters();
    const params: PendingParamEdit[] = subject.parameterFields.map(pf => {
      const tp = tracked.find(t => t.id === pf.parameterId);
      return {
        parameterId: pf.parameterId,
        parameterName: tp?.name ?? pf.parameterId,
        parameterUnit: tp?.unit ?? '',
        currentValue: pf.currentValue,
        newValue: null,
        enabled: false,
      };
    });

    this.pendingSubjectUpdates.update(list => [
      ...list,
      {subjectId, subjectCode, params, collapsed: false},
    ]);
  }

  removePendingSubjectUpdate(subjectId: string) {
    this.pendingSubjectUpdates.update(list => list.filter(p => p.subjectId !== subjectId));
  }

  togglePendingCollapsed(subjectId: string) {
    this.pendingSubjectUpdates.update(list =>
      list.map(p => p.subjectId === subjectId ? {...p, collapsed: !p.collapsed} : p)
    );
  }

  toggleParamEnabled(subjectId: string, parameterId: string) {
    this.pendingSubjectUpdates.update(list =>
      list.map(p => p.subjectId === subjectId ? {
        ...p,
        params: p.params.map(param =>
          param.parameterId === parameterId
            ? {...param, enabled: !param.enabled, newValue: !param.enabled ? param.currentValue : null}
            : param
        ),
      } : p)
    );
  }

  updateParamValue(subjectId: string, parameterId: string, value: number) {
    this.pendingSubjectUpdates.update(list =>
      list.map(p => p.subjectId === subjectId ? {
        ...p,
        params: p.params.map(param =>
          param.parameterId === parameterId ? {...param, newValue: value} : param
        ),
      } : p)
    );
  }

  /** Sync pending subjects when text changes — remove panels for subjects no longer mentioned */
  syncPendingWithText() {
    const mentionRegex = /@(\S+)/g;
    let match: RegExpExecArray | null;
    const mentionedCodes = new Set<string>();
    while ((match = mentionRegex.exec(this.newLogText)) !== null) {
      mentionedCodes.add(match[1]);
    }

    const current = this.pendingSubjectUpdates();
    const filtered = current.filter(p => mentionedCodes.has(p.subjectCode));
    if (filtered.length !== current.length) {
      this.pendingSubjectUpdates.set(filtered);
    }
  }

  // ── Logs ──

  addLog() {
    if (this.readonly()) return;
    const text = this.newLogText.trim();
    if (!text) return;

    // Parse @mentions from text
    const mentionRegex = /@(\S+)/g;
    let match: RegExpExecArray | null;
    const mentionedLabels = new Set<string>();
    while ((match = mentionRegex.exec(text)) !== null) {
      mentionedLabels.add(match[1]);
    }

    // Build SubjectUpdates from pending panel data
    const pending = this.pendingSubjectUpdates();
    const subjectUpdates: SubjectUpdate[] = this.subjects()
      .filter(s => mentionedLabels.has(s.code))
      .map(s => {
        const pendingUpdate = pending.find(p => p.subjectId === s.id);
        const parameterChanges: ParameterChange[] = pendingUpdate
          ? pendingUpdate.params
              .filter(p => p.enabled && p.newValue !== null && p.newValue !== p.currentValue)
              .map(p => ({
                id: crypto.randomUUID(),
                parameterId: p.parameterId,
                previousValue: p.currentValue,
                newValue: p.newValue!,
              }))
          : [];
        return {
          id: crypto.randomUUID(),
          subjectId: s.id,
          parameterChanges,
        };
      });

    // Resolve mentioned artifacts
    const linkedArtifacts = this.mentionableArtifacts()
      .filter(a => mentionedLabels.has(a.fileName))
      .map(a => ({
        id: a.id,
        type: 'RAW_DATA' as ArtifactType,
        fileName: a.fileName,
        storageUrl: '',
        sha256: '',
        metadata: {} as Record<string, string>,
      }));

    this.editLogEntries = [
      ...this.editLogEntries,
      {
        id: crypto.randomUUID(),
        text,
        subjectUpdates,
        artifacts: linkedArtifacts,
        createdAt: new Date().toISOString(),
      },
    ];
    this.newLogText = '';
    this.pendingSubjectUpdates.set([]);
    this.closeMention();
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

  // ── Helpers ──

  getParameterName(parameterId: string): string {
    const tp = this.trackedParameters().find(t => t.id === parameterId);
    return tp ? `${tp.name} (${tp.unit})` : parameterId;
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
