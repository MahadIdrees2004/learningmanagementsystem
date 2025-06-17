import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: true
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    grade: {
      type: Number,
      min: 0
    },
    feedback: String,
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late'],
      default: 'submitted'
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

// Add indexes for faster queries
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

export default mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
