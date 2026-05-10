import { makeAutoObservable } from "mobx";
import { EditorNode, EditorEdge } from "../shared/types/editor";
import { DraftState } from "../shared";

class DraftStore {
  private _drafts: Map<string, DraftState> = new Map();
  private _currentDraftId: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadDraftsFromStorage();
  }

  get currentDraft(): DraftState | null {
    return this._currentDraftId ? this._drafts.get(this._currentDraftId) || null : null;
  }

  get hasLocalChanges(): boolean {
    return this.currentDraft?.hasLocalChanges || false;
  }

  get lastValidationTime(): number | null {
    return this.currentDraft?.lastValidationAt || null;
  }

  get validationErrors(): any[] {
    return this.currentDraft?.validationErrors || [];
  }

  private loadDraftsFromStorage() {
    try {
      const stored = localStorage.getItem('network_drafts');
      if (stored) {
        const drafts = JSON.parse(stored);
        Object.entries(drafts).forEach(([id, draft]) => {
          this._drafts.set(id, draft as DraftState);
        });
      }
    } catch (error) {
      console.error('Failed to load drafts from localStorage:', error);
    }
  }

  private saveDraftsToStorage() {
    try {
      const draftsObj: Record<string, DraftState> = {};
      this._drafts.forEach((value, key) => {
        draftsObj[key] = value;
      });
      localStorage.setItem('network_drafts', JSON.stringify(draftsObj));
    } catch (error) {
      console.error('Failed to save drafts to localStorage:', error);
    }
  }

  createDraft(schemaId: string, schemaName: string, schemaDescription: string, nodes: EditorNode[], edges: EditorEdge[]) {
    const draft: DraftState = {
      schemaId,
      schemaName,
      schemaDescription,  // ← добавляем
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      lastSavedAt: null,
      lastValidationAt: null,
      validationErrors: [],
      hasLocalChanges: true,
    };
    
    this._drafts.set(schemaId, draft);
    this._currentDraftId = schemaId;
    this.saveDraftsToStorage();
  }

  updateDraft(schemaId: string, updates: Partial<DraftState>) {
    const draft = this._drafts.get(schemaId);
    if (draft) {
      Object.assign(draft, updates);
      draft.hasLocalChanges = true;
      this.saveDraftsToStorage();
    }
  }

  updateDraftNodes(schemaId: string, nodes: EditorNode[]) {
    this.updateDraft(schemaId, { nodes: JSON.parse(JSON.stringify(nodes)) });
  }

  updateDraftEdges(schemaId: string, edges: EditorEdge[]) {
    this.updateDraft(schemaId, { edges: JSON.parse(JSON.stringify(edges)) });
  }

  updateDraftName(schemaId: string, name: string) {
    this.updateDraft(schemaId, { schemaName: name });
  }

  setValidationResult(schemaId: string, errors: any[]) {
    const draft = this._drafts.get(schemaId);
    if (draft) {
      draft.validationErrors = errors;
      draft.lastValidationAt = Date.now();
      this.saveDraftsToStorage();
    }
  }

  markAsSaved(schemaId: string) {
    const draft = this._drafts.get(schemaId);
    if (draft) {
      draft.hasLocalChanges = false;
      draft.lastSavedAt = Date.now();
      this.saveDraftsToStorage();
    }
  }

  setCurrentDraft(schemaId: string | null) {
    this._currentDraftId = schemaId;
  }

  clearDraft(schemaId: string) {
    this._drafts.delete(schemaId);
    if (this._currentDraftId === schemaId) {
      this._currentDraftId = null;
    }
    this.saveDraftsToStorage();
  }

  clearAllDrafts() {
    this._drafts.clear();
    this._currentDraftId = null;
    this.saveDraftsToStorage();
  }

  getDraftById(schemaId: string): DraftState | null {
    return this._drafts.get(schemaId) || null;
  }

  hasDraft(schemaId: string): boolean {
    return this._drafts.has(schemaId);
  }
}

export default DraftStore;
