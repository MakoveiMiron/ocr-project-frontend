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
  id?: string;
  status?: string;
  current_step?: string;
}

export interface DocumentDetail extends DocumentSummary {
  block_count?: number;
  retention_deadline?: string | null;
  cleanup_status?: string;
  complexity_results?: Record<string, unknown>;
  ocr_routing_decisions?: Record<string, unknown>;
  docx_available?: boolean;
  latest_job?: ProcessingJobStatus;
}
