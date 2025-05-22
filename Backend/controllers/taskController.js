const Task = require('../models/Task');
   const ActivityLog = require('../models/ActivityLog');
   const Team = require('../models/Team');

   const createTask = async (req, res) => {
     const { title, description, assignedTo, deadline, priority, subtasks } = req.body;
     try {
       const task = await Task.create({
         title,
         description,
         assignedTo,
         createdBy: req.user._id,
         deadline,
         priority,
         subtasks,
       });

       await ActivityLog.create({
         userId: req.user._id,
         taskId: task._id,
         action: 'task created',
       });

       res.status(201).json(task);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const getTasks = async (req, res) => {
     const { status, priority, team, search, page = 1, limit = 10 } = req.query;
    
     try {
       let query = {};
       if (req.user.role === 'user') {
         query.assignedTo = req.user._id;
       } else if (req.user.role === 'manager') {
         const team = await Team.findById(req.user.team);
         if (team) {
           query.$or = [
             { createdBy: req.user._id },
             { assignedTo: { $in: team.members } },
           ];
         } else {
           query.createdBy = req.user._id;
         }
       }

       if (status) query.status = status;
       if (priority) query.priority = priority;
       if (team) {
         const teamData = await Team.findById(team);
         if (teamData) query.assignedTo = { $in: teamData.members };
       }
       if (search) query.$text = { $search: search };

       const tasks = await Task.find(query)
         .populate('assignedTo', 'name email')
         .populate('createdBy', 'name email')
         .skip((page - 1) * limit)
         .limit(Number(limit));

       res.json(tasks);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const getTaskById = async (req, res) => {
     try {
       const task = await Task.findById(req.params.id)
         .populate('assignedTo', 'name email')
         .populate('createdBy', 'name email');
       if (!task) return res.status(404).json({ message: 'Task not found' });

       if (req.user.role === 'user' && task.assignedTo?.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: 'Forbidden' });
       }

       res.json(task);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const updateTask = async (req, res) => {
     const updates = req.body;
     try {
       const task = await Task.findById(req.params.id);
       if (!task) return res.status(404).json({ message: 'Task not found' });

       if (req.user.role === 'user' && task.assignedTo?.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: 'Forbidden' });
       }

       Object.assign(task, updates);
       await task.save();

       await ActivityLog.create({
         userId: req.user._id,
         taskId: task._id,
         action: 'task updated',
       });

       res.json(task);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const deleteTask = async (req, res) => {
     try {
       const task = await Task.findById(req.params.id);
       if (!task) return res.status(404).json({ message: 'Task not found' });

       if (req.user.role === 'user') return res.status(403).json({ message: 'Forbidden' });

       await ActivityLog.create({
         userId: req.user._id,
         taskId: task._id,
         action: 'task deleted',
       });

       await task.deleteOne();

       res.json({ message: 'Task deleted' });
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };