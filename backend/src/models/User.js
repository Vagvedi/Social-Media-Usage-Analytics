import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * User Model
 * Stores user authentication data and profile information
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: {
      name: 'username',
      msg: 'Username already exists'
    },
    validate: {
      len: {
        args: [3, 30],
        msg: 'Username must be between 3 and 30 characters'
      },
      is: {
        args: /^[a-zA-Z0-9_]+$/,
        msg: 'Username can only contain letters, numbers, and underscores'
      },
      notEmpty: {
        msg: 'Username cannot be empty'
      }
    }
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'email',
      msg: 'Email already exists'
    },
    toLowerCase: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      }
    }
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long'
      },
      notEmpty: {
        msg: 'Password cannot be empty'
      }
    }
  },

  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: 'users',
  timestamps: true,

  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        console.log('[User Model] Hashing password before create');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },

    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        console.log('[User Model] Hashing password before update');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    console.log('[User Model] Missing password for comparison');
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('[User Model] Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('[User Model] Password comparison error:', error);
    return false;
  }
};

export default User;
