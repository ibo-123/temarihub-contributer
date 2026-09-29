import type {
  AcademicVerificationStatus,
  ContributorRole,
  Subject,
} from '../constants/contributors';

import type { Difficulty, JobStatus } from '../constants/jobs';
import type { FieldType, ReviewDecision, SubmissionStatus, TemplateType } from '../constants/templates';

export type Role = 'ADMIN' | 'CONTRIBUTOR';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Contributor = {
  id: string;
  name: string;
  email: string;
  role: 'CONTRIBUTOR';
  contributorRole: ContributorRole | null;
  subject: Subject | null;
  isActive: boolean;
  academicVerificationStatus: AcademicVerificationStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type ContributorWriteInput = {
  name: string;
  email: string;
  contributorRole: ContributorRole;
  subject: Subject;
  academicVerificationStatus: AcademicVerificationStatus;
  isActive: boolean;
};

export type ContributorCreateInput = ContributorWriteInput & {
  password: string;
};

export type TemplateField = {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  placeholder: string;
  description: string;
  options: string[];
};

export type JobTemplateSummary = {
  id: string;
  name: string;
  subject: Subject;
  type: TemplateType;
  version: number;
  fields: TemplateField[];
};

export type Template = {
  id: string;
  name: string;
  description: string;
  subject: Subject;
  type: TemplateType;
  fields: TemplateField[];
  version: number;
  isActive: boolean;
  createdBy: { id: string; name: string } | string | null;
  createdAt: string;
  updatedAt: string;
};

export type TemplateWriteInput = {
  name: string;
  description: string;
  subject: Subject;
  type: TemplateType;
  fields: TemplateField[];
  isActive: boolean;
};

export type ContributorJob = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  subject: Subject;
  topic: string;
  quantity: number;
  difficulty: Difficulty;
  deadline: string;
  instructions: string;
  status: JobStatus;
  template: JobTemplateSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type Job = ContributorJob & {
  contributor: {
    id: string;
    name: string;
    email: string;
    subject: Subject | null;
    isActive: boolean;
  } | null;
  createdBy: { id: string; name: string } | null;
};

export type JobWriteInput = {
  title: string;
  description: string;
  requirements: string;
  subject: Subject;
  topic: string;
  quantity: number;
  difficulty: Difficulty;
  deadline: string;
  instructions: string;
  contributor: string | null;
  status: JobStatus;
  template: string | null;
};

export type SubmissionFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export type SubmissionItem = {
  order: number;
  values: Record<string, string | number | null>;
};

export type SubmissionVersion = {
  number: number;
  notes: string;
  items: SubmissionItem[];
  files: SubmissionFile[];
  submittedAt: string;
};

export type SubmissionReview = {
  id: string;
  version: number;
  decision: ReviewDecision;
  feedback: string;
  createdAt: string;
  reviewer: { id: string; name?: string };
};

export type Submission = {
  id: string;
  job: {
    id: string;
    title?: string;
    subject?: Subject;
    topic?: string;
    quantity?: number;
    difficulty?: Difficulty;
    deadline?: string;
    status?: JobStatus;
  };
  template: JobTemplateSummary;
  items: SubmissionItem[];
  files: SubmissionFile[];
  notes: string;
  status: SubmissionStatus;
  currentVersion: number;
  approvedVersion: number | null;
  contentReadyAt: string | null;
  versions?: SubmissionVersion[];
  reviews?: SubmissionReview[];
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contributor?: { id: string; name: string; email: string };
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType: string;
  relatedEntityId: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
  actor: { id: string; name?: string };
};

export type LoginResult = {
  token: string;
  user: User;
};
