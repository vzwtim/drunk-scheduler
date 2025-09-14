import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Vote from './Vote';
import Results from './Results';

function EventPage() {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false); // State to toggle between Vote and Results

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
  }, [eventId]);

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
    <div>
      <h1>{event.eventName}</h1>
      <p>日程: {event.dates.join(', ')}</p>

      <div>
        <button onClick={() => setShowResults(false)}>出欠入力</button>
        <button onClick={() => setShowResults(true)}>結果を見る</button>
      </div>

      {showResults ? <Results /> : <Vote />}
    </div>
  );
}

export default EventPage;
