import React, { useState } from 'react';

function Vote({ event, onVoted, onEdit }) {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState({});

  const handleAttendanceChange = (date, value) => {
    setAttendance(prev => ({ ...prev, [date]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('名前を入力してください。');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, attendance }),
      });
      if (!response.ok) {
        throw new Error('回答の送信に失敗しました。');
      }
      const data = await response.json();
      onVoted(data);
      setName('');
      setAttendance({});
      alert('回答を送信しました！');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleEditClick = () => {
    if (window.confirm('日程を編集すると、現在の投票内容はリセットされます。よろしいですか？')) {
      onEdit();
    }
  };

  return (
    <div className="vote-container">
      <h2>2. 出欠の入力</h2>
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
                  <label><input type="radio" name={date} value="○" onChange={() => handleAttendanceChange(date, '○')} required /> ○ </label>
                  <label><input type="radio" name={date} value="△" onChange={() => handleAttendanceChange(date, '△')} /> △ </label>
                  <label><input type="radio" name={date} value="×" onChange={() => handleAttendanceChange(date, '×')} /> × </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit">出欠を登録する</button>
      </form>
      <button onClick={handleEditClick} className="edit-button">日程を編集（※リセット）</button>
    </div>
  );
}

export default Vote;
