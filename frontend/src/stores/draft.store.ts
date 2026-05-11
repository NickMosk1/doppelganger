import { makeAutoObservable, reaction } from "mobx";
import { EditorNode, EditorEdge } from "../shared/types/editor";
import { RootStore } from ".";
import { DraftState } from "../shared";

class DraftStore {
  private rootStore: RootStore;
  
  private _drafts: Map<string, DraftState> = new Map();
  private _currentDraftId: string | null = null;
  private _hasUnsavedChanges: boolean = false;
  private _isInitialized: boolean = false;
  private _isSaving: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.loadDraftsFromStorage();
    
    // Отслеживаем изменения в editorStore для автоматического обновления флага
    this.setupReactions();
  }

  get currentDraft(): DraftState | null {
    return this._currentDraftId ? this._drafts.get(this._currentDraftId) || null : null;
  }

  // ГЛАВНЫЙ ФЛАГ ДЛЯ UI
  get hasUnsavedChanges(): boolean {
    // Для новой схемы (draft-id) всегда проверяем текущий draft
    if (this._currentDraftId?.startsWith("draft-")) {
      return this._hasUnsavedChanges;
    }
    // Для сохраненных схем проверяем из draft
    return this.currentDraft?.hasUnsavedChanges || false;
  }

  get lastValidationTime(): number | null {
    return this.currentDraft?.lastValidationAt || null;
  }

  get validationErrors(): any[] {
    return this.currentDraft?.validationErrors || [];
  }

  // Настройка реакций на изменения
  private setupReactions() {
    // Реакция на изменение узлов
    reaction(
      () => ({
        nodesCount: this.rootStore.editorStore.nodes.length,
        edgesCount: this.rootStore.editorStore.edges.length,
        nodesSnapshot: JSON.stringify(
          this.rootStore.editorStore.nodes.map(n => ({
            id: n.id,
            name: n.customName || n.name,
            position: n.position,
            lengthM: n.lengthM,
          }))
        ),
        edgesSnapshot: JSON.stringify(
          this.rootStore.editorStore.edges.map(e => ({
            id: e.id,
            lengthM: e.lengthM,
            sourceNodeId: e.sourceNodeId,
            targetNodeId: e.targetNodeId,
          }))
        ),
      }),
      () => {
        // Не отмечаем как несохраненное во время процесса сохранения
        if (this._isSaving) return;
        
        if (this._isInitialized && this._currentDraftId) {
          this.markAsUnsaved();
        }
      },
      { delay: 100 }
    );
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
    this._isInitialized = true;
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

  // Отметить как несохраненное
  markAsUnsaved() {
    if (!this._currentDraftId) return;
    if (this._isSaving) return;
    
    const draft = this._drafts.get(this._currentDraftId);
    if (draft && !draft.hasUnsavedChanges) {
      draft.hasUnsavedChanges = true;
      this._hasUnsavedChanges = true;
      this.saveDraftsToStorage();
      console.log("📝 Marked as unsaved");
    } else if (this._currentDraftId.startsWith("draft-") && !this._hasUnsavedChanges) {
      this._hasUnsavedChanges = true;
      console.log("📝 Marked as unsaved (new draft)");
    }
  }

  // Отметить как сохраненное
  markAsSaved(schemaId: string) {
    this._isSaving = true;
    
    const draft = this._drafts.get(schemaId);
    if (draft) {
      // Обновляем snapshot текущего состояния
      draft.hasUnsavedChanges = false;
      draft.lastSavedAt = Date.now();
      // Обновляем сохраненные данные
      draft.nodes = JSON.parse(JSON.stringify(this.rootStore.editorStore.nodes));
      draft.edges = JSON.parse(JSON.stringify(this.rootStore.editorStore.edges));
      this.saveDraftsToStorage();
    }
    
    if (this._currentDraftId === schemaId || this._currentDraftId?.startsWith("draft-")) {
      this._hasUnsavedChanges = false;
    }
    
    console.log("💾 Marked as saved");
    
    // Небольшая задержка перед снятием флага сохранения
    setTimeout(() => {
      this._isSaving = false;
    }, 100);
  }

  createDraft(schemaId: string, schemaName: string, schemaDescription: string, nodes: EditorNode[], edges: EditorEdge[]) {
    const draft: DraftState = {
      schemaId,
      schemaName,
      schemaDescription,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      lastSavedAt: null,
      lastValidationAt: null,
      validationErrors: [],
      hasUnsavedChanges: true, // Новая схема всегда несохраненная
    };
    
    this._drafts.set(schemaId, draft);
    this._currentDraftId = schemaId;
    this._hasUnsavedChanges = true;
    this.saveDraftsToStorage();
  }

  updateDraft(schemaId: string, updates: Partial<DraftState>) {
    // Не обновляем черновик во время сохранения
    if (this._isSaving) return;
    
    const draft = this._drafts.get(schemaId);
    if (draft) {
      // Обновляем только указанные поля
      if (updates.schemaName !== undefined) draft.schemaName = updates.schemaName;
      if (updates.schemaDescription !== undefined) draft.schemaDescription = updates.schemaDescription;
      if (updates.nodes !== undefined) draft.nodes = JSON.parse(JSON.stringify(updates.nodes));
      if (updates.edges !== undefined) draft.edges = JSON.parse(JSON.stringify(updates.edges));
      
      this.saveDraftsToStorage();
    }
  }

  setValidationResult(schemaId: string, errors: any[]) {
    const draft = this._drafts.get(schemaId);
    if (draft) {
      draft.validationErrors = errors;
      draft.lastValidationAt = Date.now();
      this.saveDraftsToStorage();
    }
  }

  setCurrentDraft(schemaId: string | null) {
    this._currentDraftId = schemaId;
    // Сбрасываем флаг при смене черновика
    const draft = this._drafts.get(schemaId || "");
    this._hasUnsavedChanges = draft?.hasUnsavedChanges || false;
  }

  clearDraft(schemaId: string) {
    this._drafts.delete(schemaId);
    if (this._currentDraftId === schemaId) {
      this._currentDraftId = null;
      this._hasUnsavedChanges = false;
    }
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
