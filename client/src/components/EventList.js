import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isToday, isTomorrow, parseISO, format } from 'date-fns';
import { ja } from 'date-fns/locale';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => { // Corrected function definition
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
  }; // End of fetchEvents function

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return <div>イベントを読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  // Categorize events
  const todayTomorrowEvents = [];
  const upcomingConfirmedEvents = [];
  const schedulingInProgressEvents = [];

  events.forEach(event => {
    if (event.finalDate) {
      const finalDate = parseISO(event.finalDate);
      // Check if finalDate is today or tomorrow
      if (isToday(finalDate) || isTomorrow(finalDate)) {
        todayTomorrowEvents.push(event);
      } else {
        upcomingConfirmedEvents.push(event);
      }
    } else {
      schedulingInProgressEvents.push(event);
    }
  });

  const renderEventSection = (title, eventArray) => (
    <div className="event-section">
      <h3>{title}</h3>
      {eventArray.length === 0 ? (
        <p>現在、{title}はありません。</p>
      ) : (
        <ul>
          {eventArray.map(event => (
            <li key={event._id} className="event-list-item">
              <Link to={`/event/${event._id}`}>
                {event.eventName}
                {event.lastMinuteWelcome && (
                  <span className="last-minute-welcome-tag">
                    ドタ参歓迎！
                  </span>
                )}
                {event.finalDate ? (
                  <span className="event-status-info">
                    ({format(parseISO(event.finalDate), 'yyyy/MM/dd (EEE)', { locale: ja })} - {event.responses.length}人参加)
                  </span>
                ) : (
                  <span className="event-status-info">
                    (調整中)
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div>
      <h2>イベント一覧</h2>
      {renderEventSection('今日・明日の飲み会', todayTomorrowEvents)}
      {renderEventSection('開催予定の飲み会', upcomingConfirmedEvents)}
      {renderEventSection('調整中の飲み会', schedulingInProgressEvents)}
      <Link to="/create" className="button-link">新しいイベントを作成</Link>
    </div>
  );
}

export default EventList;
