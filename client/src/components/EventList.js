import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => { // Made fetchEvents a separate function for reusability
    try {
      const response = await fetch('/api/events'); // Backend now handles filtering and sorting
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
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`本当にイベント「${eventName}」を削除しますか？この操作は元に戻せません。`)) {
      return;
    }
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('イベントの削除に失敗しました。');
      }
      alert(`イベント「${eventName}」を削除しました。`);
      fetchEvents(); // Re-fetch events after deletion
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(err.message);
    }
  };

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
            <li key={event._id} className="event-list-item">
              <Link to={`/event/${event._id}`}>
                {event.eventName}
                {event.finalDate ? (
                  <span style={{ color: 'var(--sub-accent-color)', fontWeight: 'bold', marginLeft: '10px' }}>
                    日程確定 ({new Date(event.finalDate).toLocaleDateString()})
                  </span>
                ) : (
                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginLeft: '10px' }}>
                    日程調整中
                  </span>
                )}
                {event.lastMinuteWelcome && (
                  <span style={{ color: 'var(--sub-accent-color)', marginLeft: '10px' }}>
                    (ドタ参歓迎)
                  </span>
                )}
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); handleDeleteEvent(event._id, event.eventName); }}
                className="delete-button-list-item"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
      <Link to="/create" className="button-link">新しいイベントを作成</Link>
    </div>
  );
}

export default EventList;
