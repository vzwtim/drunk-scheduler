
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// データを一時的に保持する変数
let event = null;

// 1. 候補日程の作成
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

// 2. イベント情報（日程と出欠）の取得
app.get('/api/events', (req, res) => {
  if (!event) {
    return res.status(404).json({ error: 'イベントが見つかりません。' });
  }
  res.json(event);
});

// 3. 出欠の登録
app.post('/api/responses', (req, res) => {
  const { name, attendance } = req.body;
  if (!event) {
    return res.status(404).json({ error: 'イベントが見つかりません。' });
  }
  if (!name || !attendance) {
    return res.status(400).json({ error: '名前と出欠情報を提供してください。' });
  }

  // 同じ名前の参加者がいれば更新、いなければ追加
  const existingResponseIndex = event.responses.findIndex(r => r.name === name);
  if (existingResponseIndex > -1) {
    event.responses[existingResponseIndex] = { name, attendance };
  } else {
    event.responses.push({ name, attendance });
  }

  res.status(201).json(event);
});

// 4. イベントのリセット
app.delete('/api/events', (req, res) => {
  event = null;
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
