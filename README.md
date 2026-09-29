# Contributor Website

Phase 1 — Foundation & Authentication is complete.

Phase 2 — Contributor Management lets an Admin create contributor accounts, assign one work role and one subject, set academic verification status, and activate or deactivate accounts.

Phase 3 — Job Management lets an Admin create jobs, assign them to eligible contributors, and cancel them. Contributors see their assigned jobs under My Jobs.

Phase 4 — Templates & Submission lets an Admin define reusable submission templates and attach one template to a job. Contributors fill that structure, attach files, save a draft, and submit.

Phase 5 — Review & Revision lets an Admin review a submission, approve it, request a revision, or reject it. A contributor can edit a requested revision and resubmit. Each submit keeps a version, and each decision is kept in the review history.

Phase 6 — Content Ready marks the approved version ready for the main platform and exports it as structured JSON. The export is the handoff. It does not import the work into the main Ethio Exam platform.

Phase 7 — Notifications & Activity tells people when a job is assigned, work is submitted, a revision is requested, or a submission is approved. Contributors also get one deadline reminder. Admins can read an activity log for those workflow events.

Login still uses the system role. There are two system roles: **Admin** and **Contributor**. A contributor's work role is a separate field.

## Project overview

The Contributor Website is a small monorepo with a React frontend and an Express API. Users sign in with email and password. The API issues a JWT, and both the frontend and the backend use that token to decide which pages and routes the user can open.

## Technology stack

**Frontend**

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

**Backend**

- Node.js
- JavaScript (CommonJS)
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs

## Project structure

```text
contributor-website/
├── frontend/          React + TypeScript app
│   └── src/
│       ├── components/
│       ├── constants/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── context/
│       └── types/
├── backend/           Express API
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── scripts/
│       └── utils/
├── package.json       Root scripts
└── README.md
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally (or a MongoDB URI you can reach)

## Installation

From the project root:

```bash
npm install --prefix frontend
npm install --prefix backend
```

Copy the backend environment file and edit it:

```bash
cp backend/.env.example backend/.env
```

## Environment variables

Backend values live in `backend/.env`. Use `backend/.env.example` as the template. Do not commit `backend/.env`.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, for example `7d` |
| `ADMIN_NAME` | Initial admin display name |
| `ADMIN_EMAIL` | Initial admin email |
| `ADMIN_PASSWORD` | Initial admin password (at least 8 characters) |
| `CONTRIBUTOR_NAME` | Optional development contributor name |
| `CONTRIBUTOR_EMAIL` | Optional development contributor email |
| `CONTRIBUTOR_PASSWORD` | Optional development contributor password |
| `MAX_FILE_SIZE` | Maximum size of one submission file, in bytes (default 5 MB) |
| `MAX_FILES` | Maximum number of files on one submission (default 10) |
| `UPLOAD_DIR` | Optional directory for uploaded files. Defaults to `backend/uploads` |
| `DEADLINE_REMINDER_HOURS` | How long before a deadline to remind the contributor once (default 24) |

The frontend talks to `/api`. In development, Vite proxies that path to `http://localhost:5000`. Set `frontend/.env` with `VITE_API_URL` only if the API is not on that proxy.

## Database setup

Start MongoDB, then point `MONGO_URI` at the database. The default local database is:

```text
mongodb://127.0.0.1:27017/contributor-website
```

Example, if MongoDB is installed on this machine:

```bash
mongod --dbpath /data/db
```

Use whatever data directory your MongoDB install expects. The API creates collections when the seed script or the first write runs.

## How to start the backend

```bash
npm run dev:backend
```

The API is served at `http://localhost:5000/api`.

## How to start the frontend

In a second terminal:

```bash
npm run dev:frontend
```

Open `http://localhost:5173`.

## How to create the initial admin

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`, then run:

```bash
npm run seed
```

The script creates the admin only when that email does not already exist. Passwords are hashed with bcryptjs. They are never stored in source code.

To create a contributor account for local development, also set `CONTRIBUTOR_NAME`, `CONTRIBUTOR_EMAIL`, and `CONTRIBUTOR_PASSWORD`, then run the same seed command. The contributor is created only when that email does not already exist. New development contributors are stored as Question Creator, Mathematics, Pending, and Active. If that contributor already exists but is missing those fields, the seed script fills only the missing ones. If a variable group is incomplete, that account is skipped.

Admins create real contributor accounts from **Contributors** after signing in. The seed account is only for local development.

## Available routes

**Frontend**

| Route | Who can open it |
| --- | --- |
| `/login` | Everyone |
| `/admin/dashboard` | Admin only |
| `/admin/contributors` | Admin only |
| `/admin/contributors/new` | Admin only |
| `/admin/contributors/:id` | Admin only |
| `/admin/contributors/:id/edit` | Admin only |
| `/admin/jobs` | Admin only |
| `/admin/jobs/new` | Admin only |
| `/admin/jobs/:id` | Admin only |
| `/admin/jobs/:id/edit` | Admin only |
| `/admin/templates` | Admin only |
| `/admin/templates/new` | Admin only |
| `/admin/templates/:id` | Admin only |
| `/admin/templates/:id/edit` | Admin only |
| `/admin/submissions` | Admin only |
| `/admin/submissions/:id` | Admin only |
| `/admin/content` | Admin only |
| `/admin/activity` | Admin only |
| `/admin/notifications` | Admin only |
| `/notifications` | Signed-in user (opens their own list) |
| `/contributor/dashboard` | Contributor only |
| `/contributor/jobs` | Contributor only |
| `/contributor/jobs/:id` | Contributor only |
| `/contributor/jobs/:jobId/submission` | Contributor only |
| `/contributor/submissions` | Contributor only |
| `/contributor/notifications` | Contributor only |

Unauthenticated visits to a protected page go to `/login`. A contributor who opens an admin page is sent to the contributor dashboard. An admin who opens a contributor page is sent to the admin dashboard. An inactive contributor cannot stay signed in: login is rejected, and an existing token is rejected on the next authenticated request.

**API**

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Signed-in user |
| `GET` | `/api/admin/dashboard` | Admin only |
| `GET` | `/api/contributor/dashboard` | Active contributor only |
| `GET` | `/api/contributors` | Admin only |
| `GET` | `/api/contributors/:id` | Admin only |
| `POST` | `/api/contributors` | Admin only |
| `PUT` | `/api/contributors/:id` | Admin only |
| `PATCH` | `/api/contributors/:id/status` | Admin only |
| `PATCH` | `/api/contributors/:id/verification` | Admin only |
| `GET` | `/api/jobs` | Admin only |
| `GET` | `/api/jobs/:id` | Admin only |
| `POST` | `/api/jobs` | Admin only |
| `PUT` | `/api/jobs/:id` | Admin only |
| `PATCH` | `/api/jobs/:id/cancel` | Admin only |
| `GET` | `/api/contributor/jobs` | Active contributor (own jobs only) |
| `GET` | `/api/contributor/jobs/:id` | Active contributor (own job only) |
| `GET` | `/api/templates` | Admin only |
| `GET` | `/api/templates/:id` | Admin only |
| `POST` | `/api/templates` | Admin only |
| `PUT` | `/api/templates/:id` | Admin only |
| `PATCH` | `/api/templates/:id/status` | Admin only |
| `GET` | `/api/contributor/jobs/:jobId/submission` | Active contributor (own job) |
| `POST` | `/api/contributor/jobs/:jobId/submission` | Active contributor (own job) |
| `GET` | `/api/contributor/submissions` | Active contributor (own submissions) |
| `PUT` | `/api/submissions/:id` | Owner, draft or revision |
| `POST` | `/api/submissions/:id/submit` | Owner, draft only |
| `POST` | `/api/submissions/:id/resubmit` | Owner, revision only |
| `POST` | `/api/submissions/:id/files` | Owner, draft or revision |
| `DELETE` | `/api/submissions/:id/files/:fileId` | Owner, draft or revision |
| `GET` | `/api/submissions/:id/files/:fileId` | Owner or Admin |
| `GET` | `/api/submissions` | Admin only |
| `GET` | `/api/submissions/:id` | Admin only |
| `POST` | `/api/submissions/:id/review/start` | Admin only |
| `POST` | `/api/submissions/:id/review` | Admin only |
| `POST` | `/api/submissions/:id/content-ready` | Admin only |
| `GET` | `/api/submissions/:id/export` | Admin only, content ready |
| `GET` | `/api/content` | Admin only |
| `GET` | `/api/content/export` | Admin only |
| `GET` | `/api/notifications` | Signed-in user (own notifications) |
| `PATCH` | `/api/notifications/:id/read` | Signed-in user (own notification) |
| `PATCH` | `/api/notifications/read-all` | Signed-in user |
| `GET` | `/api/admin/activity` | Admin only |

Successful responses look like:

```json
{ "success": true, "data": {} }
```

Errors look like:

```json
{ "success": false, "message": "Error message" }
```

## Accounts

`role` is the system role used for authentication: `ADMIN` or `CONTRIBUTOR`.

`contributorRole` is the single work role assigned to a contributor. It is not a system role, and a contributor cannot have more than one. Supported values:

| Stored value | Label |
| --- | --- |
| `QUESTION_CREATOR` | Question Creator |
| `SOLUTION_CREATOR` | Solution Creator |
| `RESOURCE_CURATOR` | Resource Curator |

`subject` is the single subject assigned to a contributor. Supported values: `MATHEMATICS`, `PHYSICS`, `CHEMISTRY`, `BIOLOGY`, `ENGLISH`.

`academicVerificationStatus` is `PENDING`, `VERIFIED`, or `REJECTED`. Phase 2 stores the status only. Document upload is not part of this phase.

`isActive` is `true` or `false`. Contributor management can change this only for contributor accounts. Passwords are hashed with bcryptjs and are omitted from API responses.

## Jobs

A job is a piece of work an Admin assigns to one contributor. Fields: `title`, `description`, `requirements` (plain text), `subject` (same list as contributors), `topic` (plain text), `quantity` (positive whole number), `difficulty`, `deadline`, `instructions`, `contributor`, `template`, `status`, and `createdBy`.

`difficulty` is `EASY`, `MEDIUM`, or `HARD`.

`status` is `DRAFT`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, or `CANCELLED`. Allowed changes:

```text
DRAFT -> ASSIGNED -> IN_PROGRESS -> COMPLETED
DRAFT / ASSIGNED / IN_PROGRESS -> CANCELLED
```

New jobs are saved as `DRAFT` or `ASSIGNED`. Cancelling uses `PATCH /api/jobs/:id/cancel`, sets `CANCELLED`, and keeps the record. Cancelled and completed jobs cannot be edited. An Admin can still move a job to `IN_PROGRESS` or `COMPLETED` from the edit form. The first submit of a draft also moves an `ASSIGNED` job to `IN_PROGRESS`. Marking a submission content ready moves an `ASSIGNED` or `IN_PROGRESS` job to `COMPLETED`.

A job may reference one template. The API copies the template's fields into `templateSnapshot` when the template is selected, so later edits to the template do not change work already defined for that job. Jobs created before templates existed can stay without one. A template can be selected only when it is active and its subject matches the job. Changing the template is rejected once a submission exists. Leaving the template unchanged keeps the existing snapshot, including when that template is later deactivated.

Assignment rules, enforced by the API:

- The user must exist, have the `CONTRIBUTOR` system role, and be active.
- The contributor's subject must match the job subject. Changing a job's subject re-checks the assigned contributor.
- `ASSIGNED`, `IN_PROGRESS`, and `COMPLETED` jobs must have a contributor. A `DRAFT` may have one or none.
- The contributor cannot be changed once a job is `IN_PROGRESS`.

Deadlines are stored as UTC dates. A date picked in the form (for example `2026-10-15`) is stored as the end of that day in UTC and displayed as "October 15, 2026" for every viewer. A new job cannot have a deadline before today (UTC). `DEADLINE_REMINDER_HOURS` (default 24) is how long before that deadline a contributor receives one reminder. The API checks about every 15 minutes. A job does not get a second reminder for the same period, and cancelled, completed, or already submitted jobs are skipped.

Contributors see only their own jobs that are `ASSIGNED`, `IN_PROGRESS`, or `COMPLETED`. The API filters by the authenticated user and ignores any contributor ID sent by the client. Drafts, cancelled jobs, and other contributors' jobs return "Job not found". Contributor responses leave out the creator and other internal fields.

## Templates and submissions

A template describes the structure of the work. A job points at one template and keeps a snapshot of that structure. A submission stores the contributor's items, notes, and file metadata.

Template fields: `name`, `description`, `subject`, `type` (`QUESTION`, `SOLUTION`, or `RESOURCE`), `fields`, `isActive`, `version`, and `createdBy`. Each field has `name`, `label`, `type` (`text`, `textarea`, `number`, or `select`), `required`, `order`, `placeholder`, `description`, and `options` for select fields. Field names must be unique. Select fields need at least one unique option. Editing fields increases `version`. Deactivating a template hides it from new job selections.

A contributor has one submission per job. Status is `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `REVISION_REQUIRED`, `APPROVED`, `REJECTED`, or `CONTENT_READY`. Saving a draft or a requested revision may include fewer than the job quantity and may leave required fields empty. The first submit requires exactly that quantity, every required field, an open job (`ASSIGNED` or `IN_PROGRESS`), and a deadline that has not passed. A passed deadline still allows the draft to be viewed and saved. A requested revision can be edited and resubmitted after the deadline. Cancelled jobs cannot receive submissions. The contributor cannot set status, job, template, or owner directly.

Each submit stores a version on the submission: the items, notes, file metadata, and time. Review decisions are stored on the same submission. An Admin starts a review from `SUBMITTED` (the submission becomes `UNDER_REVIEW`) and then approves, requests a revision, or rejects. A decision is also accepted directly from `SUBMITTED`. Feedback is required for a revision or a rejection. Approve records `approvedVersion` as the current version and locks editing. Reject is final. A revision reopens editing for the owner, and resubmit creates the next version and returns the status to `SUBMITTED`.

Content ready is a separate Admin step from `APPROVED`. It sets `CONTENT_READY` and `contentReadyAt`. Export is available only then, and it uses the approved version rather than later edits. A single export is `GET /api/submissions/:id/export`. The organized list is `GET /api/content`, grouped in the admin UI by subject and topic. `GET /api/content/export` downloads every content-ready submission. The JSON includes the subject, topic, template, job, contributor name, notes, items, and file names. It does not include storage keys, and it does not send the content into the main platform.

Files are supporting artifacts. The submission document stores the original name, a generated storage key, MIME type, size, and upload time. File bytes are written under `backend/uploads` (or `UPLOAD_DIR`) and are not embedded in MongoDB. Allowed types are PDF, DOC, DOCX, XLSX, TXT, CSV, PNG, and JPEG. Executables are rejected. `MAX_FILE_SIZE` and `MAX_FILES` set the limits. Downloads go through the API, which checks ownership. Removing a file from a draft or revision keeps the bytes when a saved version still references them. Storage keys are generated UUIDs, so a caller-supplied filename is never used as a path.

## Notifications and activity

Notifications are created by the API when the matching workflow action succeeds. The frontend does not create them.

| Event | Who is notified |
| --- | --- |
| Job becomes assigned to a contributor | That contributor |
| Contributor submits or resubmits | The admin who created the job. If that admin is missing, every active admin |
| Revision requested | The contributor, including the review feedback |
| Submission approved | The contributor |
| Deadline is inside `DEADLINE_REMINDER_HOURS` | The assigned contributor, once per job and reminder period |

Saving a draft, viewing a job, or editing an already assigned job does not send another assignment notification. Reassigning the job to a different contributor notifies the new person.

Each user can list only their own notifications, mark one as read, or mark all as read. The header shows the unread count. `/notifications` opens that user's list.

Activity records sign-in, contributor create/update/activate/deactivate, job create/update/assign/cancel, submission create/submit/resubmit, revision requests, and approvals. Admins open `/admin/activity` for the recent log. Job, submission, and contributor pages show the history for that record. Contributors cannot read the activity API.

## Current phase

**Phase 7 — Notifications & Activity**

Assigning a job, submitting work, requesting a revision, and approving a submission each create a notification for the person who needs to act. Contributors receive one deadline reminder before the due time. Admins can read the activity log and the history on a job, submission, or contributor.

Earlier phases remain in place: authentication (Phase 1), contributor management (Phase 2), jobs (Phase 3), templates and submissions (Phase 4), review and revision (Phase 5), and content ready export (Phase 6).
# temarihub-contributer
