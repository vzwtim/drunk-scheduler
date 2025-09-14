const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3001;

// MongoDB Connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'drunk-scheduler-db'; // You can choose your database name

let db;

async function connectToMongo() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set.');
    process.exit(1);
  }
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB Atlas!');
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

// API routes (These must come before static file serving and catch-all)

// 1. Create a new event
app.post('/api/events', async (req, res) => {
  const { eventName, dates, lastMinuteWelcome = false, description = '' } = req.body;
  if (!eventName || !dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: 'イベント名と候補日程を提供してください。' });
  }

  try {
    const newEvent = {
      eventName,
      dates,
      responses: [],
      createdAt: new Date(),
      finalDate: null,
      lastMinuteWelcome,
      description,
    };
    const result = await db.collection('events').insertOne(newEvent);
    res.status(201).json({ _id: result.insertedId, ...newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'イベントの作成に失敗しました。' });
  }
});

// 2. Get all events (for listing) - Modified for filtering and sorting
app.get('/api/events', async (req, res) => {
  try {
    const now = new Date();
    const query = {};

    query.$or = [
      { finalDate: { $gte: now } },
      { finalDate: null, dates: { $elemMatch: { $gte: now.toISOString().split('T')[0] } } }
    ];

    const events = await db.collection('events').find(query, { projection: { eventName: 1, dates: 1, finalDate: 1, lastMinuteWelcome: 1, description: 1, responses: 1 } }).toArray();

    events.sort((a, b) => {
      const aFinalDate = a.finalDate ? new Date(a.finalDate) : null;
      const bFinalDate = b.finalDate ? new Date(b.finalDate) : null;

      if (aFinalDate && bFinalDate) {
        return aFinalDate.getTime() - bFinalDate.getTime();
      }
      if (aFinalDate) {
        return -1;
      }
      if (bFinalDate) {
        return 1;
      }

      const aEarliestDate = a.dates.length > 0 ? new Date(Math.min(...a.dates.map(d => new Date(d)))) : null;
      const bEarliestDate = b.dates.length > 0 ? new Date(Math.min(...b.dates.map(d => new Date(d)))) : null;

      if (aEarliestDate && bEarliestDate) {
        return aEarliestDate.getTime() - bEarliestDate.getTime();
      }
      return 0;
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'イベントの取得に失敗しました。' });
  }
});

// 3. Get a single event by ID (for details and voting)
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const event = await db.collection('events').findOne({ _id: new ObjectId(id) });
    if (!event) {
      return res.status(404).json({ error: 'イベントが見つかりません。' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching single event:', error);
    res.status(500).json({ error: 'イベントの取得に失敗しました。' });
  }
});

// New API Endpoint: Update an event (Edit Event)
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { eventName, dates, lastMinuteWelcome, description } = req.body;

  console.log(`[PUT /api/events/${id}] Received update request.`);
  console.log('Request body:', req.body);

  if (!eventName || !dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: 'イベント名と候補日程を提供してください。' });
  }

  try {
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $set: { eventName, dates, lastMinuteWelcome, description } }
    );

    console.log('MongoDB update result:', result);

    if (result.matchedCount === 0) {
      console.log(`Event with ID ${id} not found for update.`);
      return res.status(404).json({ error: 'イベントが見つかりません。' });
    }
    const updatedEvent = await db.collection('events').findOne({ _id: new ObjectId(id) });
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'イベントの更新に失敗しました。' });
  }
});


// New API Endpoint: Confirm Final Date for an event
app.put('/api/events/:id/confirm-date', async (req, res) => {
  const { id } = req.params;
  const { finalDate } = req.body;

  if (!finalDate) {
    return res.status(400).json({ error: '確定する日程を提供してください。' });
  }

  try {
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $set: { finalDate: new Date(finalDate) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'イベントが見つかりません。' });
    }
    const updatedEvent = await db.collection('events').findOne({ _id: new ObjectId(id) });
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error confirming final date:', error);
    res.status(500).json({ error: '日程の確定に失敗しました。' });
  }
});

// Add new API Endpoint: Unconfirm Final Date for an event
app.put('/api/events/:id/unconfirm-date', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $set: { finalDate: null } } // Set finalDate back to null
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'イベントが見つかりません。' });
    }
    const updatedEvent = await db.collection('events').findOne({ _id: new ObjectId(id) });
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error unconfirming final date:', error);
    res.status(500).json({ error: '日程の確定取り消しに失敗しました。' });
  }
});


// 4. Submit attendance response for an event
app.post('/api/responses', async (req, res) => {
  const { eventId, name, attendance } = req.body;
  if (!eventId || !name || !attendance) {
    return res.status(400).json({ error: 'イベントID、名前、出欠情報を提供してください。' });
  }

  try {
    const eventObjectId = new ObjectId(eventId);
    const event = await db.collection('events').findOne({ _id: eventObjectId });

    if (!event) {
      return res.status(404).json({ error: 'イベントが見つかりません。' });
    }

    const existingResponseIndex = event.responses.findIndex(r => r.name === name);
    if (existingResponseIndex > -1) {
      event.responses[existingResponseIndex] = { name, attendance };
    } else {
      event.responses.push({ name, attendance });
    }

    await db.collection('events').updateOne(
      { _id: eventObjectId },
      { $set: { responses: event.responses } }
    );

    res.status(201).json(event);
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: '出欠の登録に失敗しました。' });
  }
});

// 5. Delete an event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.collection('events').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'イベントが見つかりません。' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'イベントの削除に失敗しました。' });
  }
});

// New API Endpoint: Delete a participant's response from an event
app.delete('/api/events/:eventId/responses', async (req, res) => {
  const { eventId } = req.params;
  const { name } = req.body; // Get participant name from request body

  if (!name) {
    return res.status(400).json({ error: '削除する参加者の名前を提供してください。' });
  }

  try {
    const eventObjectId = new ObjectId(eventId);

    // Use $pull to remove the response object that matches the name
    const result = await db.collection('events').updateOne(
      { _id: eventObjectId },
      { $pull: { responses: { name: name } } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'イベントが見つかりません。' });
    }
    if (result.modifiedCount === 0) {
      // This can happen if the participant name doesn't exist
      return res.status(404).json({ error: '指定された名前の参加者は見つかりません。' });
    }

    const updatedEvent = await db.collection('events').findOne({ _id: eventObjectId });
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error deleting participant response:', error);
    res.status(500).json({ error: '参加者の削除に失敗しました。' });
  }
});

// Serve static files from the React app (after API routes)
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one of the API routes or static files, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Move app.listen inside an async block that waits for connectToMongo
async function startServer() {
  await connectToMongo(); // Ensure DB connection is established
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer(); // Call the new async function to start the server