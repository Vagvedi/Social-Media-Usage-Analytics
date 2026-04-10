import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const StudyGoal = sequelize.define('StudyGoal', {
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
  targetHours: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: false,
    comment: 'Target study hours'
  },
  currentHours: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: false,
    defaultValue: 0,
    comment: 'Current completed hours'
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'overdue', 'paused'),
    allowNull: false,
    defaultValue: 'active'
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#3B82F6'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  milestones: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of milestone objects'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'study_goals',
  timestamps: true,
  underscored: true
});

// Update status based on deadline and progress
StudyGoal.beforeSave(async (goal) => {
  if (goal.currentHours >= goal.targetHours) {
    goal.status = 'completed';
    goal.isCompleted = true;
  } else if (new Date() > new Date(goal.deadline) && goal.status !== 'completed') {
    goal.status = 'overdue';
  } else if (goal.status === 'completed' && goal.currentHours < goal.targetHours) {
    goal.status = 'active';
    goal.isCompleted = false;
  }
});

export default StudyGoal;
