import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Mentee from '../models/mentee.js'; // Update the path to your mentee model

const router = express.Router();

const generateToken = (mentee) => {
  return jwt.sign(
    {
      id: mentee._id,
      email: mentee.emailAddress,
    },
    process.env.JWT_SECRET, // Ensure you have this in your environment variables
    { expiresIn: '1h' }
  );
};

// Route to create a new mentee
router.post('/signup', [
  body('name').not().isEmpty().withMessage('Name is required'),
  body('affiliation').not().isEmpty().withMessage('Affiliation is required'),
  body('gender').isIn(['Male', 'Female', 'Prefer not to say', 'Other']).withMessage('Invalid gender'),
  body('emailAddress').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('phoneNumber').not().isEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if(req.body.acmMembership === "Yes") { req.body.acmMembership = true; }
    else { req.body.acmMembership = false; }
    const { name, affiliation, phoneNumber, emailAddress, gender, phdRegistration, password, acmMembership, socialHandles } = req.body;

    try {
      let mentee = await Mentee.findOne({ emailAddress });
      if (mentee) {
        return res.status(401).json({ errors: [{ msg: 'Email address already in use' }] });
      }

      mentee = new Mentee({ name, affiliation, phoneNumber, emailAddress, gender, phdRegistration, password, acmMembership, socialHandles });

      const salt = await bcrypt.genSalt();
      mentee.password = await bcrypt.hash(password, salt);

      await mentee.save();
      // const token = generateToken(mentee);
      res.status(201).send('Mentee created');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Route to login a mentee
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
      const mentee = await Mentee.findOne({ emailAddress });
      if (!mentee) {
        return res.status(400).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, mentee.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = generateToken(mentee);
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Route to update researchProblem and feedback
router.put('/update/:id', [
  body('researchProblem').not().isEmpty().withMessage('Research problem is required'),
  body('feedback').not().isEmpty().withMessage('Feedback is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedMentee = await Mentee.findByIdAndUpdate(
      req.params.id,
      { researchProblem: req.body.researchProblem, feedback: req.body.feedback },
      { new: true }
    );
    if (!updatedMentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }
    res.json(updatedMentee);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Route to apply for a mentor
router.post('/apply/:id', [
  body('mentorId').not().isEmpty().withMessage('Mentor ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedMentee = await Mentee.findByIdAndUpdate(
      req.params.id,
      { $push: { applied: req.body.mentorId } },
      { new: true }
    );
    if (!updatedMentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }
    res.json(updatedMentee);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

export default router;
