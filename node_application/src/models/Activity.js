const { initPool, formatDateTimeFromUnix, getTable } = require('../config/db');

function buildWhereClauses(params) {
  const clauses = [];
  const values = [];

  if (params.status !== undefined && params.status !== '') {
    clauses.push('ac.status = ?');
    values.push(String(params.status));
  } else {
    clauses.push('ac.status = ?');
    values.push('normal');
  }

  if (params.location) {
    clauses.push('ac.location LIKE ?');
    values.push(`%${params.location}%`);
  }

  if (params.createtime !== undefined && params.createtime !== '') {
    const ct = params.createtime;
    if (Array.isArray(ct) && ct.length >= 2) {
      clauses.push('ac.createtime BETWEEN ? AND ?');
      values.push(parseInt(ct[0], 10), parseInt(ct[1], 10));
    } else if (typeof ct === 'string' && ct.includes(',')) {
      const [start, end] = ct.split(',').map((x) => parseInt(x, 10));
      clauses.push('ac.createtime BETWEEN ? AND ?');
      values.push(start, end);
    } else {
      clauses.push('ac.createtime = ?');
      values.push(parseInt(ct, 10));
    }
  }

  const startParam = params.createtime_start ?? params.starttime ?? null;
  const endParam = params.createtime_end ?? params.endtime ?? null;
  if (startParam !== null || endParam !== null) {
    const start = startParam !== null ? parseInt(startParam, 10) : 0;
    const end = endParam !== null ? parseInt(endParam, 10) : Number.MAX_SAFE_INTEGER;
    clauses.push('ac.createtime BETWEEN ? AND ?');
    values.push(start, end);
  }

  let compareTime = Date.now() / 1000;
  if (params.compare_time !== undefined && !isNaN(params.compare_time)) {
    compareTime = parseInt(params.compare_time, 10);
  } else if (params.createtime !== undefined && !isNaN(params.createtime)) {
    compareTime = parseInt(params.createtime, 10);
  }
  const compareTimeStr = formatDateTimeFromUnix(compareTime);
  clauses.push('ac.expirationtime > ?');
  values.push(compareTimeStr);

  return { clauses, values };
}

async function search(params = {}) {
  const pool = await initPool();
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 10;
  const offset = (page - 1) * limit;

  const { clauses, values } = buildWhereClauses(params);
  const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) AS cnt FROM ${getTable('activity')} ac ${whereSql}`;
  const joinSql = `LEFT JOIN ${getTable('activity_reward')} ar ON ar.activity_id = ac.id`;
  const listSql = `
    SELECT 
      ac.*,
      ar.id AS reward_id,
      ar.registration_fee,
      ar.participant_count,
      ar.havemoney AS reward_havemoney,
      ar.status AS reward_status
    FROM ${getTable('activity')} ac 
    ${joinSql} 
    ${whereSql} 
    ORDER BY ac.id DESC 
    LIMIT ? OFFSET ?`;

  const [countRows] = await pool.query(countSql, values);
  const total = countRows[0]?.cnt || 0;

  const [listRows] = await pool.query(listSql, [...values, limit, offset]);

  return {
    list: listRows,
    total,
    page,
    limit,
  };
}

module.exports = {
  search,
  // Register a participant: increment count and add amount
  async register(activityId) {
    const pool = await initPool();
    // Increment participant_count and add registration_fee; avoid referencing non-existent columns
    const updateSql = `
      UPDATE ${getTable('activity_reward')} ar
      SET 
        ar.participant_count = COALESCE(ar.participant_count, 0) + 1,
        ar.havemoney = COALESCE(ar.havemoney, 0) + COALESCE(ar.registration_fee, 0)
      WHERE ar.activity_id = ?
    `;
    await pool.query(updateSql, [activityId]);

    const selectSql = `
      SELECT 
        ar.id AS reward_id,
        ar.registration_fee,
        ar.participant_count,
        ar.havemoney AS reward_havemoney,
        ar.status AS reward_status
      FROM ${getTable('activity_reward')} ar
      WHERE ar.activity_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(selectSql, [activityId]);
    return rows[0] || null;
  }
};