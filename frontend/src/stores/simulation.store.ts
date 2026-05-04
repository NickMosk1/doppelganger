import { makeAutoObservable } from "mobx";
import { CriticalEvent, GlobalFactors, NodeSimulationResult, SimulationConfig, SimulationHistoryItem, SimulationProgress, SimulationResult } from "../shared";

class SimulationStore {
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;
  private _progress: SimulationProgress = {
    currentTime: 0,
    totalDuration: 0,
    percentage: 0,
    isRunning: false,
  };

  private _currentResult: SimulationResult | null = null;
  private _nodeResults: Map<string, NodeSimulationResult> = new Map();
  private _criticalEvents: CriticalEvent[] = [];
  private _history: SimulationHistoryItem[] = [];

  private _config: SimulationConfig = {
    durationSeconds: 60,
    stepSeconds: 5,
    globalFactors: {
      temperature: 25,
      emi: 20,
      vibration: 10,
      dust: 10,
    },
  };
  
  // Валидация
  private _validationErrors: any[] = [];
  private _lastValidationAt: number | null = null;
  private _isValidating: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  // ============ GETTERS ============
  
  get isRunning() {
    return this._isRunning;
  }

  get isPaused() {
    return this._isPaused;
  }

  get progress() {
    return this._progress;
  }

  get currentResult() {
    return this._currentResult;
  }

  get nodeResults() {
    return Array.from(this._nodeResults.values());
  }

  get criticalEvents() {
    return this._criticalEvents;
  }

  get hasCriticalEvents() {
    return this._criticalEvents.length > 0;
  }

  get config() {
    return this._config;
  }

  get globalFactors() {
    return this._config.globalFactors;
  }

  get validationErrors() {
    return this._validationErrors;
  }

  get lastValidationAt() {
    return this._lastValidationAt;
  }

  get isValidating() {
    return this._isValidating;
  }

  get history() {
    return this._history;
  }

  // ============ SETTERS ============
  
  setRunning(running: boolean) {
    this._isRunning = running;
    this._progress.isRunning = running;
  }

  setPaused(paused: boolean) {
    this._isPaused = paused;
  }

  setProgress(progress: Partial<SimulationProgress>) {
    Object.assign(this._progress, progress);
  }

  setCurrentResult(result: SimulationResult | null) {
    this._currentResult = result;
    if (result) {
      this._progress.totalDuration = result.durationSeconds;
    }
  }

  setNodeResults(results: Map<string, NodeSimulationResult>) {
    this._nodeResults = results;
  }

  setNodeResult(nodeId: string, result: NodeSimulationResult) {
    this._nodeResults.set(nodeId, result);
  }

  setCriticalEvents(events: CriticalEvent[]) {
    this._criticalEvents = events;
  }

  addCriticalEvent(event: CriticalEvent) {
    this._criticalEvents.push(event);
  }

  setValidationErrors(errors: any[]) {
    this._validationErrors = errors;
  }

  setLastValidationAt(timestamp: number | null) {
    this._lastValidationAt = timestamp;
  }

  setIsValidating(validating: boolean) {
    this._isValidating = validating;
  }

  setHistory(history: SimulationHistoryItem[]) {
    this._history = history;
  }

  addHistoryItem(item: SimulationHistoryItem) {
    this._history.unshift(item);
  }

  setDuration(seconds: number) {
    this._config.durationSeconds = seconds;
  }

  setStepSeconds(seconds: number) {
    this._config.stepSeconds = seconds;
  }

  setGlobalFactors(factors: Partial<GlobalFactors>) {
    Object.assign(this._config.globalFactors, factors);
  }

  setTemperature(value: number) {
    this._config.globalFactors.temperature = value;
  }

  setEmi(value: number) {
    this._config.globalFactors.emi = value;
  }

  setVibration(value: number) {
    this._config.globalFactors.vibration = value;
  }

  setDust(value: number) {
    this._config.globalFactors.dust = value;
  }

  // ============ ACTIONS ============
  
  reset() {
    this._isRunning = false;
    this._isPaused = false;
    this._currentResult = null;
    this._nodeResults.clear();
    this._criticalEvents = [];
    this._progress = {
      currentTime: 0,
      totalDuration: this._config.durationSeconds,
      percentage: 0,
      isRunning: false,
    };
  }

  clearValidation() {
    this._validationErrors = [];
    this._lastValidationAt = null;
  }

  clearHistory() {
    this._history = [];
  }

  // Получение результата для конкретного узла
  getResultForNode(nodeId: string): NodeSimulationResult | undefined {
    return this._nodeResults.get(nodeId);
  }

  // Получение общей оценки
  getOverallGrade(): string {
    if (this._criticalEvents.some(e => e.severity === "FATAL")) return "F";
    if (this._criticalEvents.some(e => e.severity === "CRITICAL")) return "D";
    if (this._criticalEvents.length > 5) return "C";
    if (this._criticalEvents.length > 0) return "B";
    return "A";
  }
}

export default SimulationStore;
