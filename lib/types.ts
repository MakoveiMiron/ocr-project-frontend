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

export interface DocumentDetail extends DocumentSummary {
  document_id?: string;
  document_status?: string;
  block_count?: number;
  retention_deadline?: string | null;
  cleanup_status?: string;
  complexity_scores?: Record<string, unknown>;
  ocr_routing_decisions?: Array<{ block_id: string; engine: string; reason: string }> | Record<string, unknown>;
  docx_available?: boolean;
  job_id?: string;
  job_status?: string;
  current_step?: string;
  error_message?: string | null;
  latest_job?: ProcessingJobStatus;
}

export interface AuthorizationUrlResponse {
  authorization_url: string;
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
