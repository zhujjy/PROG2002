const ActivityModel = require('../../../models/Activity');

function mapParams(query) {
  const params = { ...query };
  if (params.createtime && !isNaN(params.createtime)) {
    params.compare_time = parseInt(params.createtime, 10);
    delete params.createtime;
  }
  return params;
}

async function getActivity(req, res) {
  try {
    const params = mapParams(req.query);
    const result = await ActivityModel.search(params);
    return res.json({
      code: 200,
      msg: 'success',
      data: result.list,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (err) {
    return res.status(500).json({ code: 500, msg: err.message, data: [] });
  }
}

// Register participant and increase amount
async function register(req, res) {
  try {
    const { activity_id } = req.body || {};
    const id = parseInt(activity_id, 10);
    if (!id || isNaN(id)) {
      return res.status(400).json({ code: 400, msg: 'Invalid activity_id', data: null });
    }

    const updated = await ActivityModel.register(id);
    return res.json({ code: 200, msg: 'success', data: updated });
  } catch (err) {
    return res.status(500).json({ code: 500, msg: err.message, data: null });
  }
}

module.exports = {
  getActivity,
  register,
};