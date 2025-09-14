import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Results() { // Removed event prop
  const { id: eventId } = useParams(); // Get eventId from URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div>結果を読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  if (!event) {
    return <div>イベントが見つかりません。</div>;
  }

  // Calculate attendance summary
  const attendanceSummary = {};
  event.dates.forEach(date => {
    attendanceSummary[date] = { '○': 0, '△': 0, '×': 0 };
  });

  event.responses.forEach(response => {
    for (const date in response.attendance) {
      const status = response.attendance[date];
      if (attendanceSummary[date] && attendanceSummary[date][status] !== undefined) {
        attendanceSummary[date][status]++;
      }
    } 
  });

  return (
    <div className="results-container">
      <h2>{event.eventName} - 結果</h2> {/* Display event name */}
      <h3>参加者一覧:</h3>
      {event.responses.length === 0 ? (
        <p>まだ誰も出欠を登録していません。</p>
      ) : (
        <ul>
          {event.responses.map((response, index) => (
            <li key={index}>{response.name}</li>
          ))}
        </ul>
      )}

      <h3>日程別集計:</h3>
      <table>
        <thead>
          <tr>
            <th>日程</th>
            <th>○</th>
            <th>△</th>
            <th>×</th>
          </tr>
        </thead>
        <tbody>
          {event.dates.map(date => (
            <tr key={date}>
              <td>{date}</td>
              <td>{attendanceSummary[date]['○']}</td>
              <td>{attendanceSummary[date]['△']}</td>
              <td>{attendanceSummary[date]['×']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Results;