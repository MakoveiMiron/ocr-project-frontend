export type PlanCode = 'free' | 'starter' | 'pro';

export interface Plan {
  code: PlanCode;
  name: string;
  priceLabel: string;
  limits: string[];
}

export interface DocumentSummary {
  id: string;
  original_filename: string;
  status: string;
}
