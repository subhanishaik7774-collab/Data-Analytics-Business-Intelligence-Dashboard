const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is not defined in server/.env.');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL to setup database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    console.log(`📖 Reading schema file: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🛠️ Creating tables and indexes...');
    await client.query(schemaSql);
    console.log('✅ Schema created successfully!');

    console.log(`📖 Reading seed file: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Seeding default values...');
    await client.query(seedSql);
    console.log('✅ Database seeded successfully! 🎉');

  } catch (err) {
    console.error('❌ Error executing database setup:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

setupDatabase();
