import React, { useState, useEffect } from 'react';

function Results({ event, onResponseSubmitted }) {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (event && name) {
      const existingResponse = event.responses.find(r => r.name === name);
      if (existingResponse) {
        setAttendance(existingResponse.attendance);
      } else {
        setAttendance({});
      }
    }
  }, [event, name]);

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
        alert('少なくとも1つの日程に出欠を入力してください。' );
        return;
    }

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: event._id, name, attendance }),
      });
      if (!response.ok) {
        throw new Error('回答の送信に失敗しました。');
      }
      alert('回答を送信しました！');
      onResponseSubmitted();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (!event) {
    return <div>イベントデータがありません。</div>;
  }

  // Calculate attendance summary and most likely date
  const dateScores = {};
  event.dates.forEach(date => {
    dateScores[date] = 0;
  });

  event.responses.forEach(response => {
    for (const date in response.attendance) {
      const status = response.attendance[date];
      if (status === '○') dateScores[date] += 2;
      else if (status === '△') dateScores[date] += 1;
    }
  });

  let mostLikelyDate = null;
  let maxScore = -1;
  for (const date in dateScores) {
    if (dateScores[date] > maxScore) {
      maxScore = dateScores[date];
      mostLikelyDate = date;
    }
  }

  return (
    <div className="results-container">
      <h2>結果</h2>

      <h3>参加者別詳細:</h3>
      <form onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>日程</th>
              {event.responses.map((response, index) => (
                <th key={response.name || index}>{response.name}</th>
              ))}
              <th>
                <input
                  type="text"
                  placeholder="あなたの名前"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="name-input-in-table"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {event.dates.map(date => (
              <tr key={date} className={date === mostLikelyDate ? 'most-likely-date' : ''}> {/* Highlight most likely date */}
                <td>{date}</td>
                {event.responses.map((response, index) => (
                  <td key={index}>{response.attendance[date] || '-'}</td>
                ))}
                <td className="attendance-buttons-cell">
                  <button
                    type="button"
                    className={`attendance-button ${attendance[date] === '○' ? 'selected' : ''}`}
                    onClick={() => handleAttendanceChange(date, '○')}
                  >
                    ○
                  </button>
                  <button
                    type="button"
                    className={`attendance-button ${attendance[date] === '△' ? 'selected' : ''}`}
                    onClick={() => handleAttendanceChange(date, '△')}
                  >
                    △
                  </button>
                  <button
                    type="button"
                    className={`attendance-button ${attendance[date] === '×' ? 'selected' : ''}`}
                    onClick={() => handleAttendanceChange(date, '×')}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {/* Summary row */}
            <tr>
              <td>**集計**</td>
              {event.responses.map((response, index) => (
                <td key={index}></td> // Empty cells for participant columns
              ))}
              <td>
                {mostLikelyDate && (
                  <span style={{ fontWeight: 'bold', color: 'var(--sub-accent-color)' }}>
                    最有力: {mostLikelyDate}
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td colSpan={event.dates.length + event.responses.length}> 
                <button type="submit" className="submit-attendance-button">出欠を登録</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}

export default Results;