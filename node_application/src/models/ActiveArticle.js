const { initPool, formatDateTimeFromUnix, getTable } = require('../config/db');

function buildWhereClauses(params) {
  const clauses = [];
  const values = [];

  if (params.tag) {
    clauses.push('aa.Tag LIKE ?');
    values.push(`%${params.tag}%`);
  }

  if (params.tickets !== undefined && params.tickets !== '') {
    clauses.push('aa.Tickets = ?');
    values.push(String(params.tickets));
  }

  if (params.registration) {
    clauses.push('aa.Registration LIKE ?');
    values.push(`%${params.registration}%`);
  }

  const activityClauses = [];
  const activityValues = [];

  if (params.location) {
    activityClauses.push('ac.location LIKE ?');
    activityValues.push(`%${params.location}%`);
  }

  if (params.created_filter !== undefined && params.created_filter !== '') {
    const ct = params.created_filter;
    if (Array.isArray(ct) && ct.length >= 2) {
      activityClauses.push('ac.createtime BETWEEN ? AND ?');
      activityValues.push(parseInt(ct[0], 10), parseInt(ct[1], 10));
    } else if (typeof ct === 'string' && ct.includes(',')) {
      const [start, end] = ct.split(',').map((x) => parseInt(x, 10));
      activityClauses.push('ac.createtime BETWEEN ? AND ?');
      activityValues.push(start, end);
    } else {
      activityClauses.push('ac.createtime = ?');
      activityValues.push(parseInt(ct, 10));
    }
  }

  const startParam = params.createtime_start ?? params.starttime ?? null;
  const endParam = params.createtime_end ?? params.endtime ?? null;
  if (startParam !== null || endParam !== null) {
    const start = startParam !== null ? parseInt(startParam, 10) : 0;
    const end = endParam !== null ? parseInt(endParam, 10) : Number.MAX_SAFE_INTEGER;
    activityClauses.push('ac.createtime BETWEEN ? AND ?');
    activityValues.push(start, end);
  }

  let compareTime = Math.floor(Date.now() / 1000);
  if (params.compare_time !== undefined && !isNaN(params.compare_time)) {
    compareTime = parseInt(params.compare_time, 10);
  } else if (params.createtime !== undefined && !isNaN(params.createtime)) {
    compareTime = parseInt(params.createtime, 10);
  }
  const compareTimeStr = formatDateTimeFromUnix(compareTime);
  activityClauses.push('ac.expirationtime > ?');
  activityValues.push(compareTimeStr);

  const joinedActivity = activityClauses.length > 0;

  return {
    clauses,
    values,
    activityClauses,
    activityValues,
    joinedActivity,
  };
}

async function search(params = {}) {
  const pool = await initPool();
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 10;
  const offset = (page - 1) * limit;

  const { clauses, values, activityClauses, activityValues, joinedActivity } = buildWhereClauses(params);

  const whereParts = [];
  const allValues = [];

  if (clauses.length) {
    whereParts.push(clauses.join(' AND '));
    allValues.push(...values);
  }
  if (activityClauses.length) {
    whereParts.push(activityClauses.join(' AND '));
    allValues.push(...activityValues);
  }

  const whereSql = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
  // 始终左连接活动表，以便返回完整字段
  const joinSql = `
    LEFT JOIN ${getTable('activity')} ac ON ac.article_detail_id = aa.Id
    LEFT JOIN ${getTable('activity_reward')} ar ON ar.activity_id = ac.id
  `;

  const countSql = `SELECT COUNT(*) AS cnt FROM ${getTable('active_article')} aa ${joinSql} ${whereSql}`;
  // 明确选择并别名化字段，与 PHP 返回结构对齐
  const listSql = `
    SELECT 
      aa.Id AS article_id,
      aa.Id AS article_detail_id,
      aa.Tag,
      aa.Tickets,
      aa.Articlecontent,
      aa.updatetime,
      ac.id AS activity_id,
      ac.background_image,
      ac.title,
      ac.subtitle,
      ac.status,
      ac.createtime,
      ac.expirationtime,
      ac.deletetime,
      ac.currency_type,
      ac.location,
      ac.target_amount,
      ar.id AS reward_id,
      ar.registration_fee,
      ar.participant_count,
      ar.havemoney AS reward_havemoney,
      ar.status AS reward_status
    FROM ${getTable('active_article')} aa 
    ${joinSql} 
    ${whereSql} 
    ORDER BY aa.Id DESC 
    LIMIT ? OFFSET ?`;

  const [countRows] = await pool.query(countSql, allValues);
  const total = countRows[0]?.cnt || 0;

  const [listRows] = await pool.query(listSql, [...allValues, limit, offset]);

  return {
    list: listRows,
    total,
    page,
    limit,
  };
}

module.exports = {
  search,
};