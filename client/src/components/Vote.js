import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Vote() { // Removed onVoted, onEdit props
  const { id: eventId } = useParams(); // Get eventId from URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('イベントの取得に失敗しました。');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]); // Re-fetch if eventId changes

  const handleAttendanceChange = (date, value) => {
    setAttendance(prev => ({ ...prev, [date]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('名前を入力してください。');
      return;
    }
    if (Object.keys(attendance).length === 0) {
        alert('少なくとも1つの日程に出欠を入力してください。');
        return;
    }

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, name, attendance }), // Include eventId
      });
      if (!response.ok) {
        throw new Error('回答の送信に失敗しました。');
      }
      // const data = await response.json(); // Not using data directly here
      alert('回答を送信しました！');
      // Optionally, clear form or navigate to results
      setName('');
      setAttendance({});
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) {
    return <div>イベント情報を読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  if (!event) {
    return <div>イベントが見つかりません。</div>;
  }

  return (
    <div className="vote-container">
      <h2>{event.eventName} - 出欠の入力</h2> {/* Display event name */}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="あなたの名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>日程</th>
              <th>出欠</th>
            </tr>
          </thead>
          <tbody>
            {event.dates.map(date => (
              <tr key={date}>
                <td>{date}</td>
                <td>
                  <label><input type="radio" name={date} value="○" onChange={() => handleAttendanceChange(date, '○')} checked={attendance[date] === '○'} required /> ○ </label>
                  <label><input type="radio" name={date} value="△" onChange={() => handleAttendanceChange(date, '△')} checked={attendance[date] === '△'} /> △ </label>
                  <label><input type="radio" name={date} value="×" onChange={() => handleAttendanceChange(date, '×')} checked={attendance[date] === '×'} /> × </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit">出欠を登録する</button>
      </form>
      {/* Removed Edit button as event dates are now fixed after creation */}
    </div>
  );
}

export default Vote;