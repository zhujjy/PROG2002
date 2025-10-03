const express = require('express');
const ActivityCtrl = require('../application/api/controller/Activity');
const ActiveArticleCtrl = require('../application/api/controller/active/Article');

const router = express.Router();

// Health/index
router.get('/index', (req, res) => {
  res.json({ code: 200, msg: 'Request succeeded' });
});

// Activity endpoints
router.get('/activity/getActivity', ActivityCtrl.getActivity);
router.post('/activity/register', ActivityCtrl.register);

// Active Article endpoints
router.get('/active/article/search', ActiveArticleCtrl.search);

module.exports = router;