import { Nullable } from "../../utils";
import { EditorEdge, EditorNode } from "./editor";

export interface DraftState {
  schemaId: string;
  schemaName: string;
  schemaDescription: string;
  nodes: EditorNode[];
  edges: EditorEdge[];
  lastSavedAt: Nullable<number>;
  lastValidationAt: Nullable<number>;
  validationErrors: any[];
  hasUnsavedChanges: boolean;
};
