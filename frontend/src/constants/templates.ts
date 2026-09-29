export const TEMPLATE_TYPES = [
  { value: 'QUESTION', label: 'Question' },
  { value: 'SOLUTION', label: 'Solution' },
  { value: 'RESOURCE', label: 'Resource' },
] as const;

export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
] as const;

export const SUBMISSION_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'REVISION_REQUIRED', label: 'Revision Required' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CONTENT_READY', label: 'Content Ready' },
] as const;

export const REVIEW_DECISIONS = [
  { value: 'APPROVED', label: 'Approve' },
  { value: 'REVISION_REQUIRED', label: 'Request revision' },
  { value: 'REJECTED', label: 'Reject' },
] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number]['value'];
export type FieldType = (typeof FIELD_TYPES)[number]['value'];
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]['value'];
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number]['value'];

export function templateTypeLabel(value: string) {
  return TEMPLATE_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function fieldTypeLabel(value: string) {
  return FIELD_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function submissionStatusLabel(value: string) {
  return SUBMISSION_STATUSES.find((item) => item.value === value)?.label ?? value;
}

export function isTemplateType(value: string): value is TemplateType {
  return TEMPLATE_TYPES.some((item) => item.value === value);
}

export function isFieldType(value: string): value is FieldType {
  return FIELD_TYPES.some((item) => item.value === value);
}
