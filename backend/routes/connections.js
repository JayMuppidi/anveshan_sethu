import express from 'express';
import { body, validationResult } from 'express-validator';
import Connection from '../models/connections.js'; 
import mentee from '../models/mentee.js';
const router = express.Router();


router.post('/create', [
  body('menteeEmail').not().isEmpty().withMessage('Mentee Email is required'),
  body('mentorId').not().isEmpty().withMessage('Mentor ID is required'),
  body('status').isIn(['met', 'scheduled', 'applied', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { menteeEmail, mentorId, status } = req.body;
  const menteee = await mentee.findOne({emailAddress: menteeEmail });
  if (!menteee) {
    return res.status(404).json({ message: 'Mentee not found' });
  }
  const menteeId = menteee._id;
  try {
    const connection = new Connection({ menteeId, mentorId, status });
    await connection.save();
    res.status(201).json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/update/:id', [
  body('status').isIn(['met', 'scheduled', 'applied', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedConnection = await Connection.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updatedConnection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json(updatedConnection);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Route to fetch all details of both mentor and mentee for a specific connection
router.get('/details/:id', async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id)
      .populate('menteeId', '-password') 
      .populate('mentorId', '-password'); 

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.json(connection);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});
router.get('/fetch-applied', async (req, res) => {
    try {
      const connections = await Connection.find({
        status: { $in: ['applied'] }
      })
      .populate('menteeId', '-password') 
      .populate('mentorId', '-password'); 
  
      if (!connections.length) {
        return res.status(203).json({ message: 'No connections found' });
      }
  
      res.json(connections);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });
  
export default router;
