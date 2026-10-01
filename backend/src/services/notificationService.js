const Job = require('../models/Job');
const Notification = require('../models/Notification');
const Submission = require('../models/Submission');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;
const REMINDER_CHECK_MS = 15 * 60 * 1000;
const OPEN_REMINDER_SUBMISSION_STATUSES = ['DRAFT', 'REVISION_REQUIRED'];

function reminderHours() {
  const parsed = Number(process.env.DEADLINE_REMINDER_HOURS);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 24;
  }
  return parsed;
}

function serializeNotification(notification) {
  return {
    id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedEntityType: notification.relatedEntityType,
    relatedEntityId: notification.relatedEntityId,
    link: notification.link || '',
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
}

async function createNotification(input) {
  const notification = await Notification.create(input);
  return notification;
}

async function notifyJobAssigned(contributorId, job) {
  await createNotification({
    recipient: contributorId,
    type: 'JOB_ASSIGNED',
    title: 'New Job Assigned',
    message: `You have been assigned a new job: ${job.title}.`,
    relatedEntityType: 'Job',
    relatedEntityId: job._id,
    link: `/contributor/jobs/${job._id}`,
  });
}

async function notifySubmissionReceived({ adminId, contributorName, job, submissionId, resubmitted }) {
  const verb = resubmitted ? 'resubmitted' : 'submitted';
  const title = job?.title || 'Topic Resource';
  await createNotification({
    recipient: adminId,
    type: 'SUBMISSION_RECEIVED',
    title: resubmitted ? 'Submission Updated' : 'New Submission',
    message: `${contributorName} ${verb} the job: ${title}.`,
    relatedEntityType: 'Submission',
    relatedEntityId: submissionId,
    link: `/admin/submissions/${submissionId}`,
  });
}

async function submissionRecipients(job) {
  if (job?.createdBy) {
    const owner = await User.findById(job.createdBy).select('role isActive');
    if (owner && owner.role === 'ADMIN' && owner.isActive !== false) {
      return [owner._id];
    }
  }

  const admins = await User.find({ role: 'ADMIN', isActive: { $ne: false } }).select('_id');
  return admins.map((admin) => admin._id);
}

async function notifyAdminsOfSubmission(job, submissionId, contributorName, { resubmitted }) {
  const recipients = await submissionRecipients(job);
  await Promise.all(recipients.map((adminId) => notifySubmissionReceived({
    adminId,
    contributorName,
    job,
    submissionId,
    resubmitted,
  })));
}

async function notifyRevisionRequested(contributorId, job, submissionId, feedback) {
  const detail = feedback ? ` ${feedback}` : '';
  const title = job?.title || 'Topic Resource';
  const link = job?._id ? `/contributor/jobs/${job._id}/submission` : `/contributor/resources/${submissionId}`;
  await createNotification({
    recipient: contributorId,
    type: 'REVISION_REQUESTED',
    title: 'Revision Requested',
    message: `Revision requested for: ${title}.${detail}`,
    relatedEntityType: 'Submission',
    relatedEntityId: submissionId,
    link,
  });
}

async function notifySubmissionApproved(contributorId, job, submissionId) {
  const title = job?.title || 'Topic Resource';
  const link = job?._id ? `/contributor/jobs/${job._id}/submission` : `/contributor/resources/${submissionId}`;
  await createNotification({
    recipient: contributorId,
    type: 'SUBMISSION_APPROVED',
    title: 'Submission Approved',
    message: `Your submission for ${title} has been approved.`,
    relatedEntityType: 'Submission',
    relatedEntityId: submissionId,
    link,
  });
}

async function listForUser(user) {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: user._id }).sort({ createdAt: -1, _id: -1 }).limit(50),
    Notification.countDocuments({ recipient: user._id, isRead: false }),
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    unreadCount,
  };
}

async function markRead(user, id) {
  if (typeof id !== 'string' || !OBJECT_ID_PATTERN.test(id)) {
    throw new AppError(400, 'Invalid notification ID');
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: user._id },
    { isRead: true },
    { returnDocument: 'after' },
  );

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  return serializeNotification(notification);
}

async function markAllRead(user) {
  await Notification.updateMany({ recipient: user._id, isRead: false }, { isRead: true });
  return { unreadCount: 0 };
}

function reminderMessage(job, hours) {
  if (hours === 24) {
    return `Your job '${job.title}' is due tomorrow.`;
  }
  return `Your job '${job.title}' is due within ${hours} hours.`;
}

async function runDeadlineReminders(now = new Date()) {
  const hours = reminderHours();
  const horizon = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const jobs = await Job.find({
    status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
    contributor: { $ne: null },
    deadline: { $gt: now, $lte: horizon },
  });

  let created = 0;

  for (const job of jobs) {
    const submission = await Submission.findOne({ job: job._id }).select('status');
    if (submission && !OPEN_REMINDER_SUBMISSION_STATUSES.includes(submission.status)) {
      continue;
    }

    const reminderKey = String(hours);
    const existing = await Notification.findOne({
      recipient: job.contributor,
      type: 'DEADLINE_REMINDER',
      relatedEntityType: 'Job',
      relatedEntityId: job._id,
      reminderKey,
    });
    if (existing) {
      continue;
    }

    try {
      await createNotification({
        recipient: job.contributor,
        type: 'DEADLINE_REMINDER',
        title: 'Deadline Reminder',
        message: reminderMessage(job, hours),
        relatedEntityType: 'Job',
        relatedEntityId: job._id,
        link: `/contributor/jobs/${job._id}`,
        reminderKey,
      });
      created += 1;
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }
    }
  }

  return { created };
}

function startDeadlineReminders() {
  const run = () => {
    runDeadlineReminders().catch((error) => {
      console.error('Deadline reminder check failed:', error.message);
    });
  };

  run();
  const timer = setInterval(run, REMINDER_CHECK_MS);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
  return timer;
}

module.exports = {
  notifyJobAssigned,
  notifyAdminsOfSubmission,
  notifyRevisionRequested,
  notifySubmissionApproved,
  listForUser,
  markRead,
  markAllRead,
  runDeadlineReminders,
  startDeadlineReminders,
  reminderHours,
};
