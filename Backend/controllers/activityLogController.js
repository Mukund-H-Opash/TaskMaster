const ActivityLog = require('../models/ActivityLog');

   const getActivityLogs = async (req, res) => {
     const { userId, taskId, startDate, endDate, page = 1, limit = 10 } = req.query;
     try {
       let query = {};
       if (req.user.role !== 'admin') {
         query.userId = req.user._id;
       } else {
         if (userId) query.userId = userId;
       }
       if (taskId) query.taskId = taskId;
       if (startDate || endDate) {
         query.timestamp = {};
         if (startDate) query.timestamp.$gte = new Date(startDate);
         if (endDate) query.timestamp.$lte = new Date(endDate);
       }

       const logs = await ActivityLog.find(query)
         .populate('userId', 'name email')
         .populate('taskId', 'title')
         .skip((page - 1) * limit)
         .limit(Number(limit))
         .sort({ timestamp: -1 });

       res.json(logs);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   module.exports = { getActivityLogs };