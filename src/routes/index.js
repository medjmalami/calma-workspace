const express = require('express');

const authRoutes = require('./auth.routes');
const availabilityRoutes = require('./availability.routes');
const clientRoutes = require('./client.routes');
const healthRoutes = require('./health.routes');
const roomRoutes = require('./room.routes');

const router = express.Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(clientRoutes);
router.use(availabilityRoutes);
router.use(roomRoutes);

module.exports = router;
