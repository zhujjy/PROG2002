const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

let pool;
const tablePrefix = process.env.DB_PREFIX || 'fa_';

function getConfig() {
  const {
    DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
  } = process.env;
  return {
    host: DB_HOST || '127.0.0.1',
    port: DB_PORT ? parseInt(DB_PORT, 10) : 3306,
    user: DB_USER || 'root',
    password: DB_PASSWORD || '',
    database: DB_NAME || 'charityevents',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'local',
    dateStrings: true
  };
}

async function initPool() {
  if (!pool) {
    pool = mysql.createPool(getConfig());
  }
  return pool;
}

function getTable(name) {
  return `${tablePrefix}${name}`;
}

function formatDateTimeFromUnix(unixSeconds) {
  const d = new Date(unixSeconds * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}

module.exports = {
  initPool,
  formatDateTimeFromUnix,
  getTable,
};