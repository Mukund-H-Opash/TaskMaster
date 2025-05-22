const express = require('express');
   const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
   const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
   const router = express.Router();

   router.use(authMiddleware);

   router.post('/', roleMiddleware(['admin', 'manager']), createTask);
   router.get('/', getTasks);
   router.get('/:id', getTaskById);
   router.patch('/:id', updateTask);
   router.delete('/:id', roleMiddleware(['admin', 'manager']), deleteTask);

   module.exports = router;