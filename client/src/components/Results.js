import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FiTrash2 } from 'react-icons/fi';

function Results({ event, onResponseSubmitted }) {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState({});

  // Sort dates chronologically
  const sortedDates = [...event.dates].sort((a, b) => new Date(a) - new Date(b));

  // Effect to pre-fill attendance if name matches an existing response
  useEffect(() => {
    if (event && name) {
      const existingResponse = event.responses.find(r => r.name === name);
      if (existingResponse) {
        setAttendance(existingResponse.attendance);
      } else {
        setAttendance({}); // Clear if name doesn't match
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

  const handleParticipantClick = (participantName, participantAttendance) => {
    setName(participantName);
    setAttendance(participantAttendance);
  };

  const handleDeleteParticipant = async (participantName) => {
    if (!window.confirm(`参加者「${participantName}」を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${event._id}/responses`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: participantName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '参加者の削除に失敗しました。');
      }

      alert(`参加者「${participantName}」を削除しました。`);
      onResponseSubmitted(); // Refresh the event data
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert(error.message);
    }
  };

  if (!event) {
    return <div>イベントデータがありません。</div>;
  }

  const numParticipants = event.responses.length;
  const numFixedColumns = 2; // Date column and Input column
  const totalColumns = numParticipants + numFixedColumns;

  // Calculate the minimum width of the table to ensure horizontal scroll appears correctly
  const tableMinWidth = 140 + 140 + numParticipants * 90; // 140 for date, 140 for input, 90 for each participant

  // Calculate attendance summary for each date
  const dateAttendanceCounts = {};
  sortedDates.forEach(date => {
    dateAttendanceCounts[date] = { '○': 0, '△': 0, '×': 0 };
  });

  event.responses.forEach(response => {
    for (const date in response.attendance) {
      const status = response.attendance[date];
      if (dateAttendanceCounts[date] && dateAttendanceCounts[date][status] !== undefined) {
        dateAttendanceCounts[date][status]++;
      }
    }
  });

  // Calculate most likely date(s)
  const dateScores = {};
  sortedDates.forEach(date => {
    dateScores[date] = 0;
  });

  event.responses.forEach(response => {
    for (const date in response.attendance) {
      const status = response.attendance[date];
      if (status === '○') dateScores[date] += 2;
      else if (status === '△') dateScores[date] += 1;
    }
  });

  let maxScore = -1;
  let mostLikelyDates = [];
  for (const date in dateScores) {
    if (dateScores[date] > maxScore) {
      maxScore = dateScores[date];
      mostLikelyDates = [date];
    } else if (dateScores[date] === maxScore && maxScore > -1) {
      mostLikelyDates.push(date);
    }
  }

  return (
    <div className="results-container">
      {/* Removed <h2>結果</h2> */}

      {/* Removed <h3>参加者別詳細:</h3> */}
      <form onSubmit={handleSubmit}>
        <div className={`table-container ${numParticipants === 0 ? 'no-participants' : ''}`}> {/* Wrapper for horizontal scrolling */}
          <table style={{ minWidth: tableMinWidth }}>
            <thead>
              <tr>
              <th>日程</th>
              {event.responses.map((response, index) => (
                <th key={response.name || index}>
                  <div className="participant-name-header">
                    <span className="participant-name" onClick={() => handleParticipantClick(response.name, response.attendance)}>
                      {response.name}
                    </span>
                    <button
                      type="button"
                      className="delete-participant-button"
                      onClick={() => handleDeleteParticipant(response.name)}
                      aria-label={`参加者 ${response.name} を削除`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </th>
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
            {sortedDates.map(date => (
              <tr key={date} className={mostLikelyDates.includes(date) ? 'most-likely-date-row' : ''}> 
                <td>
                  {format(parseISO(date), 'yyyy-MM-dd (EEE)', { locale: ja })} 
                  <br />
                  <span className="attendance-counts">
                    ○{dateAttendanceCounts[date]['○']} △{dateAttendanceCounts[date]['△']} ×{dateAttendanceCounts[date]['×']}
                  </span>
                </td>
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
            <tr>
              <td colSpan={totalColumns}> 
                <button type="submit" className="submit-attendance-button">出欠を登録</button>
              </td>
            </tr>
          </tbody>
        </table>
        </div> {/* Wrapper for horizontal scrolling */}
      </form>
    </div>
  );
}

export default Results;
