import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Mentor from '../models/mentor.js'; // Update the path to your mentor model

const router = express.Router();

const generateToken = (mentor) => {
  return jwt.sign(
    {
      id: mentor._id,
      email: mentor.emailAddress,
    },
    process.env.JWT_SECRET, // Ensure you have this in your environment variables
    { expiresIn: '1h' }
  );
};
router.get('/all', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.status(200).json(mentors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to create a new mentor
router.post('/signup', [
  body('name').not().isEmpty().withMessage('Name is required'),
  body('affiliation').not().isEmpty().withMessage('Affiliation is required'),
  body('emailAddress').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('researchInterests').not().isEmpty().withMessage('Research interests are required'),
  body('meetingLink').not().isEmpty().withMessage('Meeting link is required')
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, affiliation, emailAddress, password, researchInterests, meetingLink, socialHandles } = req.body;

    try {
      let mentor = await Mentor.findOne({ emailAddress });
      if (mentor) {
        return res.status(401).json({ errors: [{ msg: 'Email address already in use' }] });
      }

      mentor = new Mentor({ name, affiliation, emailAddress, password, researchInterests, meetingLink, socialHandles });

      const salt = await bcrypt.genSalt();
      mentor.password = await bcrypt.hash(password, salt);

      await mentor.save();
      //const token = generateToken(mentor);
      res.status(201).send("Mentor created");
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Route to login a mentor
router.post('/login', [
  body('emailAddress').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailAddress, password } = req.body;

    try {
      const mentor = await Mentor.findOne({ emailAddress });
      if (!mentor) {
        return res.status(400).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, mentor.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = generateToken(mentor);
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Route to update research interests and meeting link
router.put('/update/:id', [
  body('researchInterests').not().isEmpty().withMessage('Research interests are required'),
  body('meetingLink').not().isEmpty().withMessage('Meeting link is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedMentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { researchInterests: req.body.researchInterests, meetingLink: req.body.meetingLink },
      { new: true }
    );
    if (!updatedMentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.json(updatedMentor);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});
export default router;
