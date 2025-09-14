const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API routes
let event = null;

app.post('/api/events', (req, res) => {
  const { dates } = req.body;
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: '候補日程を提供してください。' });
  }
  event = {
    dates: dates,
    responses: []
  };
  res.status(201).json(event);
});

app.get('/api/events', (req, res) => {
  if (!event) {
    return res.status(404).json({ error: 'イベントが見つかりません。' });
  }
  res.json(event);
});

app.post('/api/responses', (req, res) => {
  const { name, attendance } = req.body;
  if (!event) {
    return res.status(404).json({ error: 'イベントが見つかりません。' });
  }
  if (!name || !attendance) {
    return res.status(400).json({ error: '名前と出欠情報を提供してください。' });
  }

  const existingResponseIndex = event.responses.findIndex(r => r.name === name);
  if (existingResponseIndex > -1) {
    event.responses[existingResponseIndex] = { name, attendance };
  } else {
    event.responses.push({ name, attendance });
  }

  res.status(201).json(event);
});

app.delete('/api/events', (req, res) => {
  event = null;
  res.status(204).send();
});

// The "catchall" handler: for any request that doesn't
// match one of the API routes, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});