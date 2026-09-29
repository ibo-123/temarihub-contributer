const mongoose = require('mongoose');
const { SUBMISSION_STATUSES } = require('../constants/templates');

const fieldSchema = new mongoose.Schema(
  {
    name: String,
    label: String,
    type: String,
    required: Boolean,
    order: Number,
    placeholder: String,
    description: String,
    options: [String],
  },
  { _id: false },
);

const snapshotSchema = new mongoose.Schema(
  {
    templateId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    version: { type: Number, required: true },
    type: { type: String, required: true },
    subject: { type: String, required: true },
    fields: { type: [fieldSchema], required: true },
  },
  { _id: false },
);

const itemSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storageKey: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const submissionSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      unique: true,
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    templateSnapshot: {
      type: snapshotSchema,
      required: true,
    },
    items: {
      type: [itemSchema],
      default: [],
    },
    files: {
      type: [fileSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: 'DRAFT',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    currentVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    approvedVersion: {
      type: Number,
      default: null,
    },
    contentReadyAt: {
      type: Date,
      default: null,
    },
    versions: {
      type: [
        new mongoose.Schema(
          {
            number: { type: Number, required: true },
            items: { type: [itemSchema], default: [] },
            notes: { type: String, default: '' },
            files: { type: [fileSchema], default: [] },
            submittedAt: { type: Date, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    reviews: {
      type: [
        new mongoose.Schema(
          {
            version: { type: Number, required: true },
            reviewer: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            decision: {
              type: String,
              enum: { values: ['APPROVED', 'REVISION_REQUIRED', 'REJECTED'], message: 'Invalid review decision' },
              required: true,
            },
            feedback: { type: String, default: '' },
            createdAt: { type: Date, default: Date.now },
          },
          { _id: true },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Submission', submissionSchema);
module.exports.snapshotSchema = snapshotSchema;
