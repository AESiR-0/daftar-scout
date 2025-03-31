const { Pool } = require('pg'); // Use 'mysql2' for MySQL
const fs = require('fs');

// Database connection configuration
const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432, // Default PostgreSQL port
});

async function insertLanguages() {
  try {
    // Read the JSON file
    const data = fs.readFileSync('e:\\DaftarOS\\intrusive-scout\\languages.json', 'utf8');
    const languages = JSON.parse(data);

    // Insert each language into the database
    const query = 'INSERT INTO languages (name) VALUES ($1)';
    for (const language of languages) {
      await pool.query(query, [language]);
    }

    console.log('Languages inserted successfully!');
  } catch (error) {
    console.error('Error inserting languages:', error);
  } finally {
    await pool.end();
  }
}

insertLanguages();
