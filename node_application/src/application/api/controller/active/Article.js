const ArticleModel = require('../../../../models/ActiveArticle');

function mapParams(query) {
  const params = { ...query };
  if (params.createtime && !isNaN(params.createtime)) {
    params.compare_time = parseInt(params.createtime, 10);
    delete params.createtime;
  }
  return params;
}

async function search(req, res) {
  try {
    const params = mapParams(req.query);
    const result = await ArticleModel.search(params);
    // FastAdmin Api->success style
    const time = Math.floor(Date.now() / 1000).toString();
    return res.json({ code: 1, msg: 'Success', time, data: result });
  } catch (err) {
    return res.status(500).json({ code: 0, msg: err.message, data: { list: [], total: 0, page: 1, limit: 10 } });
  }
}

module.exports = {
  search,
};