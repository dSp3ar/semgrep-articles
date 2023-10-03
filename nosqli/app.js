const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const sanitizeUserInput = require('./sanitizeMiddleware'); // Import the middleware that sanitizes user input

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  age: Number,
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Use body-parser middleware to parse JSON request body
app.use(bodyParser.json());

/**
 * Create a new user and save it to the database.
 * @route POST /users
 * @param {User} req.body - User data from the request body.
 * @returns {User} The created user.
 */
app.post('/users', (req, res) => {
  const userData = req.body;
  const newUser = new User(userData);
  newUser.save()
    .then((savedUser) => {
      res.status(201).json(savedUser);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Get all users from the database.
 * @route GET /users
 * @returns {User[]} Array of user objects.
 */
app.get('/users', (req, res) => {
  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Get users by age using query parameters.
 * @route GET /users/by-age
 * @param {number} req.query.minAge - Minimum age filter.
 * @param {number} req.query.maxAge - Maximum age filter.
 * @returns {User[]} Array of user objects matching the age range.
 */
app.get('/users/by-age', (req, res) => {
  const minAge = parseInt(req.query.minAge);
  const maxAge = parseInt(req.query.maxAge);

  User.find({ age: { $gte: minAge, $lte: maxAge } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Get a specific user by ID.
 * @route GET /users/:userId
 * @param {string} req.params.userId - The ID of the user to retrieve.
 * @returns {User} The user with the specified ID.
 */
app.get('/users/:userId', (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Update a specific user by ID.
 * @route PUT /users/:userId
 * @param {string} req.params.userId - The ID of the user to update.
 * @param {User} req.body - Updated user data from the request body.
 * @returns {User} The updated user.
 */
app.put('/users/:userId', sanitizeUserInput, (req, res) => {
  const userId = req.params.userId;
  User.findByIdAndUpdate(userId, req.body, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(updatedUser);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Delete a specific user by ID.
 * @route DELETE /users/:userId
 * @param {string} req.params.userId - The ID of the user to delete.
 * @returns {void}
 */
app.delete('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  User.findByIdAndRemove(userId)
    .then((deletedUser) => {
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(204).send(); // No content (user successfully deleted)
    })
    .catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Get information about the server.
 * @route GET /server-info
 * @returns {Object} Information about the server (e.g., name, version, uptime).
 */
app.get('/server-info', (req, res) => {
  const serverInfo = {
    name: 'My Express Server',
    version: '1.0.0',
    uptime: process.uptime(),
  };
  res.status(200).json(serverInfo);
});

/**
 * Echo back the user's input data.
 * @route POST /echo
 * @param {string} req.body.data - Data provided by the user in the request body.
 * @returns {Object} An object containing the echoed data.
 */
app.post('/echo', (req, res) => {
  const inputData = req.body.data;
  if (!inputData) {
    return res.status(400).json({ error: 'Data is missing in the request body' });
  }
  res.status(200).json({ echoedData: inputData });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
