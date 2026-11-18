const express = require('express');

const clientRoutes = require('./client.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

router.use(healthRoutes);
router.use(clientRoutes);

module.exports = router;
