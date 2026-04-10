import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const StudySession = sequelize.define('StudySession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  focusScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    min: 0,
    max: 100,
    comment: 'Focus score from 0-100'
  },
  productivity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  breaksTaken: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  interruptions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'study_sessions',
  timestamps: true,
  underscored: true
});

// Calculate duration before saving
StudySession.beforeSave(async (session) => {
  if (session.startTime && session.endTime) {
    const duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60));
    session.duration = duration;
  }
});

export default StudySession;
