export interface ValidationResult {
  valid: boolean;
  errors: Array<{ type: string; message: string; nodeId?: string }>;
}

export interface ValidationResponse {
  valid: boolean;
  errors: Array<{
    type: string;
    message: string;
    nodeId?: string;
  }>;
}
