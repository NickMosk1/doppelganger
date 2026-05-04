import { Nullable } from "../../utils";
import { EditorEdge, EditorNode } from "./editor";

export interface DraftState {
  schemaId: string;
  schemaName: string;
  nodes: EditorNode[];
  edges: EditorEdge[];
  lastSavedAt: Nullable<number>;
  lastValidationAt: Nullable<number>;
  validationErrors: any[];
  hasLocalChanges: boolean;
};
