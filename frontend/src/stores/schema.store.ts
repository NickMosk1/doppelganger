import { makeAutoObservable } from "mobx";
import { SchemaSummary } from "../shared";

class SchemaStore {
  private _schemas: SchemaSummary[] = [];
  private _isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get schemas() {
    return this._schemas;
  }

  get isLoading() {
    return this._isLoading;
  }

  get publicSchemasCount() {
    return this._schemas.filter(s => s.isPublic).length;
  }

  get privateSchemasCount() {
    return this._schemas.filter(s => !s.isPublic).length;
  }

  get totalSchemas() {
    return this._schemas.length;
  }

  setSchemas(schemas: SchemaSummary[]) {
    this._schemas = schemas;
  }

  setLoading(loading: boolean) {
    this._isLoading = loading;
  }

  addSchema(schema: SchemaSummary) {
    this._schemas.unshift(schema);
  }

  updateSchema(id: string, data: Partial<SchemaSummary>) {
    const index = this._schemas.findIndex(s => s.id === id);
    if (index !== -1) {
      this._schemas[index] = { ...this._schemas[index], ...data };
    }
  }

  removeSchema(id: string) {
    this._schemas = this._schemas.filter(s => s.id !== id);
  }

  clearSchemas() {
    this._schemas = [];
  }
}

export default SchemaStore;
