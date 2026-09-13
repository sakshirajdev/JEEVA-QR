const express = require('express');
const router = express.Router();

const pageRoutes = require('./page.routes');
const apiRoutes = require('./api.routes');

// API routes mounted under /api
router.use('/api', apiRoutes);

// Page & HTML routes mounted at root level
router.use('/', pageRoutes);

module.exports = router;
