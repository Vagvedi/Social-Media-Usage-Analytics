import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * UsageLog Model
 * Tracks daily social media usage per app
 * Prevents duplicate entries per user/app/day combination
 */
const UsageLog = sequelize.define('UsageLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  appName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
      notEmpty: true
    },
    field: 'app_name'
  },
  minutesSpent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 1440,
      notEmpty: true
    },
    field: 'minutes_spent'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  intention: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'intention'
  },
  foundIt: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
    field: 'found_it'
  }
}, {
  tableName: 'usage_logs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'app_name', 'date'],
      name: 'unique_user_app_date'
    },
    {
      fields: ['user_id', 'date'],
      name: 'idx_user_date'
    }
  ]
});

export default UsageLog;
