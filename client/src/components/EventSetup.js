import React, { useState } from 'react';

function EventSetup({ onEventCreated }) {
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
        body: JSON.stringify({ dates: filteredDates }),
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
      <h2>1. 候補日程の入力</h2>
      <form onSubmit={handleSubmit} className="date-inputs">
        {dates.map((date, index) => (
          <div key={index}>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(index, e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={handleAddDate}>日程を追加</button>
        <button type="submit">イベント作成</button>
      </form>
    </div>
  );
}

export default EventSetup;
