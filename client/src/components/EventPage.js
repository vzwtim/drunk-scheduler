import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Results from './Results';

function EventPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFinalDate, setSelectedFinalDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchEventData = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('イベントの取得に失敗しました。');
      }
      const data = await response.json();
      setEvent(data);
      if (data.finalDate) {
        setSelectedFinalDate(data.finalDate.split('T')[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleConfirmDate = async () => {
    if (!selectedFinalDate) {
      alert('確定する日程を選択してください。');
      return;
    }
    if (!window.confirm(`${selectedFinalDate}に日程を確定しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/confirm-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finalDate: selectedFinalDate }),
      });
      if (!response.ok) {
        throw new Error('日程の確定に失敗しました。');
      }
      alert('日程を確定しました！');
      fetchEventData();
    } catch (err) {
      console.error('Error confirming date:', err);
      alert(err.message);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('本当にこのイベントを削除しますか？この操作は元に戻せません。')) {
      return;
    }
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('イベントの削除に失敗しました。');
      }
      alert('イベントを削除しました。');
      navigate('/');
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(err.message);
    }
  };

  const handleUpdateEvent = async (updatedEventData) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEventData),
      });
      if (!response.ok) {
        throw new Error('イベントの更新に失敗しました。');
      }
      alert('イベントを更新しました！');
      setIsEditing(false);
      fetchEventData();
    } catch (err) {
      console.error('Error updating event:', err);
      alert(err.message);
    }
  };


  if (loading) {
    return <div>イベント情報を読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  if (!event) {
    return <div>イベントが見つかりません。</div>;
  }

  const eventStatus = event.finalDate ? '日程確定' : '日程調整中';
  const statusColor = event.finalDate ? 'var(--sub-accent-color)' : 'var(--accent-color)';

  return (
    <div className="event-page-container">
      <button onClick={() => navigate(-1)} className="back-button">戻る</button> {/* Back button */}
      <h1>{event.eventName}</h1>
      {event.description && <p className="event-description">{event.description}</p>}
      <p>
        ステータス: <span style={{ color: statusColor, fontWeight: 'bold' }}>{eventStatus}</span>
        {event.finalDate && ` (${new Date(event.finalDate).toLocaleDateString()})`}
      </p>
      {event.lastMinuteWelcome && <p style={{ color: 'var(--sub-accent-color)', fontWeight: 'bold' }}>ドタ参歓迎！</p>}

      <div className="event-actions">
        <button onClick={() => setIsEditing(true)}>イベントを編集</button>
        <button onClick={handleDeleteEvent} className="delete-button">イベントを削除</button>
      </div>

      {isEditing && (
        <EditEventForm
          event={event}
          onUpdate={handleUpdateEvent}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {!event.finalDate && (
        <div className="date-confirmation-section">
          <h3>日程を確定する</h3>
          <select
            value={selectedFinalDate}
            onChange={(e) => setSelectedFinalDate(e.target.value)}
          >
            <option value="">日程を選択...</option>
            {event.dates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          <button onClick={handleConfirmDate}>この日程に確定</button>
        </div>
      )}

      <Results event={event} onResponseSubmitted={fetchEventData} />
    </div>
  );
}

// New component for editing event details
function EditEventForm({ event, onUpdate, onCancel }) {
  const [eventName, setEventName] = useState(event.eventName);
  const [dates, setDates] = useState(event.dates);
  const [lastMinuteWelcome, setLastMinuteWelcome] = useState(event.lastMinuteWelcome);
  const [description, setDescription] = useState(event.description || '');

  const handleAddDate = () => {
    setDates([...dates, '']);
  };

  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const handleRemoveDate = (index) => {
    const newDates = dates.filter((_, i) => i !== index);
    setDates(newDates);
  };

  const handleSubmit = (e) => {
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
    onUpdate({ eventName, dates: filteredDates, lastMinuteWelcome, description });
  };

  return (
    <div className="edit-event-form">
      <h3>イベントを編集</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="editEventName">イベント名:</label>
          <input
            id="editEventName"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editDescription">イベント説明:</label>
          <textarea
            id="editDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          ></textarea>
        </div>
        <div className="form-group">
          <label>候補日程:</label>
          {dates.map((date, index) => (
            <div key={index} className="date-input-group">
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(index, e.target.value)}
              />
              <button type="button" onClick={() => handleRemoveDate(index)} className="remove-date-button">削除</button>
            </div>
          ))}
          <button type="button" onClick={handleAddDate}>日程を追加</button>
        </div>
        <div className="form-group checkbox-group">
          <input
            id="editLastMinuteWelcome"
            type="checkbox"
            checked={lastMinuteWelcome}
            onChange={(e) => setLastMinuteWelcome(e.target.checked)}
          />
          <label htmlFor="editLastMinuteWelcome">ドタ参歓迎</label>
        </div>
        <button type="submit">更新</button>
        <button type="button" onClick={onCancel} className="cancel-button">キャンセル</button>
      </form>
    </div>
  );
}

export default EventPage;
