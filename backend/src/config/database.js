import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully');

    // Import models to register them
    const UserModule = await import('../models/User.js');
    const UsageLogModule = await import('../models/UsageLog.js');
    
    const User = UserModule.default;
    const UsageLog = UsageLogModule.default;

    // Define associations
    User.hasMany(UsageLog, { foreignKey: 'userId', as: 'usageLogs' });
    UsageLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Sync models (disable alter:true in production)
    await sequelize.sync({ alter: true });
    console.log('📦 Database synchronized');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
