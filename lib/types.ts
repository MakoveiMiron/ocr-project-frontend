export type PlanCode = 'free' | 'pro' | 'enterprise';

export interface Plan {
  code: PlanCode;
  name: string;
  priceLabel: string;
  limits: string[];
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export type AccountType = 'individual' | 'company';

export interface OrganizationMember {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface DocumentSummary {
  id: string;
  original_filename: string;
  status: string;
}

export interface ProcessingJobStatus {
  job_id?: string;
  job_status?: string;
  current_step?: string;
  error_message?: string | null;
}

export interface DocumentDetail {
  document_id: string;
  original_filename: string;
  document_status: string;
  job_id: string | null;
  job_status: string | null;
  current_step: string | null;
  block_count: number | null;
  complexity_scores: Record<string, unknown> | null;
  ocr_routing_decisions: Array<{ block_id: string; engine: string; reason: string }> | Record<string, unknown> | null;
  retention_deadline: string | null;
  cleanup_status: string | null;
  docx_available: boolean;
  created_at: string;
  error_message: string | null;
  latest_job?: ProcessingJobStatus;
  pipeline_version?: string | null;
  translation_friendly?: boolean | null;
  preserve_layout?: boolean | null;
  ocr_provider?: string | null;
  layout_mode?: string | null;
  qa_report_url?: string | null;
  artifacts?: DocumentArtifact[] | null;
  warnings?: string[] | null;
}

export interface AuthorizationUrlResponse {
  authorization_url: string;
}

export interface SessionLoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: AuthMeResponse;
}

export interface AuthCallbackResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  name: string;
  organization_id: string;
}

export interface RegisterOrganizationRequest {
  account_type: AccountType;
  organization_name?: string | null;
  full_name: string;
  billing_email: string;
  email: string;
  password: string;
  plan_code: PlanCode;
}

export interface RegisterOrganizationResponse {
  organization_id: string;
  account_type: AccountType;
  plan_code: PlanCode;
  checkout_url?: string | null;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: AuthMeResponse;
}

export interface UploadInitRequest {
  filename: string;
  content_type: string;
  size_bytes: number;
}

export interface UploadInitResponse {
  document_id: string;
  upload_url: string;
  storage_key: string;
}

export interface ProcessDocumentRequest {
  engine_policy: string;
  translation_friendly?: boolean;
  preserve_layout?: boolean;
}

export interface ProcessDocumentResponse {
  job_id: string;
  status: string;
}

export interface DocumentArtifact {
  kind: string;
  storage_key: string;
}

export interface DocumentQaResponse {
  qa_report_url?: string | null;
  warnings?: string[] | null;
}

export interface DocumentArtifactsResponse {
  artifacts?: DocumentArtifact[] | null;
  warnings?: string[] | null;
}

export interface DocumentIrResponse {
  ir_url?: string | null;
}

export interface BillingCheckoutResponse {
  checkout_url: string;
}

export interface BillingPortalResponse {
  portal_url: string;
}
