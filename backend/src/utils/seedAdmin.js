import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, db } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedUsers = async () => {
  initDb();
  
  // Wait for tables to be created
  setTimeout(async () => {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const staffPassword = await bcrypt.hash('staff123', salt);

    // Seed Admin
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', adminPassword, 'Admin'],
      (err) => {
        if (err && !err.message.includes('UNIQUE constraint failed')) {
          console.error(err.message);
        } else if (!err) {
          console.log('Admin user created: admin@example.com / admin123');
        }
      }
    );

    // Seed Staff
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Staff User', 'staff@example.com', staffPassword, 'Staff'],
      (err) => {
        if (err && !err.message.includes('UNIQUE constraint failed')) {
          console.error(err.message);
        } else if (!err) {
          console.log('Staff user created: staff@example.com / staff123');
        }
        db.close();
      }
    );
  }, 1000);
};

seedUsers();
