// server/index.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
let db;

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db('quitbuddy');
  console.log('MongoDB connected');
})();

// --- AUTH ENDPOINTS ---

// Register
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

  const users = db.collection('users');
  const existing = await users.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: hashed,
    name,
    preferred_avatar: 'lisa',
    preferred_speed: 'normal',
    created_at: new Date()
  };
  const result = await users.insertOne(user);
  const savedUser = await users.findOne({ _id: result.insertedId });
  delete savedUser.password;
  res.json(savedUser);
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const users = db.collection('users');
  const user = await users.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid email or password' });

  delete user.password;
  res.json(user);
});

// --- OTHER ENDPOINTS (unchanged) ---
app.post('/api/messages', async (req, res) => {
  const { user_id, role, content } = req.body;
  await db.collection('conversations').insertOne({ user_id, role, content, ts: new Date() });
  res.json({ ok: true });
});

app.get('/api/messages/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const messages = await db.collection('conversations')
    .find({ user_id })
    .sort({ ts: 1 })
    .toArray();
  res.json(messages);
});

app.put('/api/preferences/:user_id', async (req, res) => {
  const { user_id } = req.body;
  const { preferred_avatar, preferred_speed } = req.body;
  await db.collection('users').updateOne(
    { _id: user_id },
    { $set: { preferred_avatar, preferred_speed } }
  );
  res.json({ ok: true });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend: http://localhost:${PORT}`));