import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

function EventSetup({ onEventCreated }) {
  const [eventName, setEventName] = useState('');
  const [dates, setDates] = useState([]);
  const [lastMinuteWelcome, setLastMinuteWelcome] = useState(false);
  const [description, setDescription] = useState('');

  const handleDayPickerSelect = (selectedDays) => {
    if (selectedDays) {
      const formattedDates = Array.from(selectedDays).map(date => format(date, 'yyyy-MM-dd'));
      setDates(formattedDates);
    } else {
      setDates([]);
    }
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
      {/* Removed back button */}
      <h2>イベントの作成</h2>
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
          <TextareaAutosize
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="イベントの詳細や注意事項などを入力してください。"
            minRows={4}
          />
        </div>

        <h3>候補日程の選択</h3>
        <div className="date-picker-container">
          <DayPicker
            mode="multiple"
            selected={dates.map(d => new Date(d))}
            onSelect={handleDayPickerSelect}
            showOutsideDays
            fixedWeeks
          />
          {dates.length > 0 && (
            <p>選択中の日程: {dates.sort().join(', ')}</p>
          )}
        </div>
        
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
