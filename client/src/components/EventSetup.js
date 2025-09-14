import React, { useState } from 'react';

function EventSetup({ onEventCreated }) {
  const [eventName, setEventName] = useState(''); // New state for event name
  const [dates, setDates] = useState(['']);

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
    const filteredDates = dates.filter(date => date); // 空の入力を除外
    if (!eventName.trim()) { // Validate event name
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
        body: JSON.stringify({ eventName, dates: filteredDates }), // Include eventName
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
      <h2>1. イベントの作成</h2> {/* Changed heading */}
      <form onSubmit={handleSubmit} className="event-setup-form"> {/* Added class for potential styling */}
        <div className="form-group"> {/* New form group for event name */}
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

        <h3>候補日程の入力</h3> {/* New sub-heading */}
        <div className="date-inputs">
          {dates.map((date, index) => (
            <div key={index} className="date-input-group"> {/* Added class */}
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={handleAddDate}>日程を追加</button>
        <button type="submit">イベント作成</button>
      </form>
    </div>
  );
}

export default EventSetup;