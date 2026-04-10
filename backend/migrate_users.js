import { sequelize } from './src/config/database.js';

async function migrate() {
  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN refresh_token TEXT;');
    console.log('✅ Successfully added refresh_token column to users table.');
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
       console.log('Column already exists.');
    } else {
       console.error('Migration failed:', error);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
