import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('イベントの取得に失敗しました。');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return <div>イベントを読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div>
      <h2>開催中のイベント</h2>
      {events.length === 0 ? (
        <p>現在、開催中のイベントはありません。</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event._id}>
              <Link to={`/event/${event._id}`}>
                {event.eventName} ({event.dates.length}日程)
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/create">新しいイベントを作成</Link>
    </div>
  );
}

export default EventList;
