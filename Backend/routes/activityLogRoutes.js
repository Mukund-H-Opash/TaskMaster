const express = require('express');
   const { getActivityLogs } = require('../controllers/activityLogController');
   const { authMiddleware } = require('../middleware/authMiddleware');
   const router = express.Router();

   router.use(authMiddleware);

   router.get('/', getActivityLogs);

   module.exports = router;