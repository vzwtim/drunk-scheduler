import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function EventSetup({ onEventCreated }) {
  const navigate = useNavigate(); // Initialize useNavigate
  const [eventName, setEventName] = useState('');
  const [dates, setDates] = useState(['']);
  const [lastMinuteWelcome, setLastMinuteWelcome] = useState(false);
  const [description, setDescription] = useState('');

  const handleAddDate = () => {
    setDates([...dates, '']);
  };

  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredDates = dates.filter(date => date);
    if (!eventName.trim()) {
        alert('イベント名を入力してください。');
        return;
    }
    if (filteredDates.length === 0) {
        alert('少なくとも1つの日程を入力してください。');
        return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventName, dates: filteredDates, lastMinuteWelcome, description }),
      });
      if (!response.ok) {
        throw new Error('イベントの作成に失敗しました。');
      }
      const data = await response.json();
      onEventCreated(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="back-button">戻る</button> {/* Back button */}
      <h2>1. イベントの作成</h2>
      <form onSubmit={handleSubmit} className="event-setup-form">
        <div className="form-group">
          <label htmlFor="eventName">イベント名:</label>
          <input
            id="eventName"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="例: 飲み会、会議"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">イベント説明:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="イベントの詳細や注意事項などを入力してください。"
            rows="4"
          ></textarea>
        </div>

        <h3>候補日程の入力</h3>
        <div className="date-inputs">
          {dates.map((date, index) => (
            <div key={index} className="date-input-group">
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={handleAddDate}>日程を追加</button>
        
        <div className="form-group checkbox-group">
          <input
            id="lastMinuteWelcome"
            type="checkbox"
            checked={lastMinuteWelcome}
            onChange={(e) => setLastMinuteWelcome(e.target.checked)}
          />
          <label htmlFor="lastMinuteWelcome">ドタ参歓迎</label>
        </div>

        <button type="submit">イベント作成</button>
      </form>
    </div>
  );
}

export default EventSetup;
