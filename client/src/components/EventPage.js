import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Import icons
import Results from './Results';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

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

  const handleUnconfirmDate = async () => {
    if (!window.confirm('日程の確定を取り消しますか？')) {
      return;
    }
    try {
      const response = await fetch(`/api/events/${eventId}/unconfirm-date`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('日程の確定取り消しに失敗しました。');
      }
      alert('日程の確定を取り消しました。');
      fetchEventData();
    } catch (err) {
      console.error('Error unconfirming date:', err);
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
      <button onClick={() => navigate(-1)} className="back-button">← 戻る</button>
      <div className="event-header-with-actions"> {/* New container for header and actions */}
        <h1>{event.eventName}</h1>
        <div className="event-actions-top-right"> {/* New div for top-right actions */}
          <button onClick={() => setIsEditing(true)} className="icon-button" aria-label="編集">
            <FiEdit />
          </button>
          <button onClick={handleDeleteEvent} className="icon-button delete-button" aria-label="削除">
            <FiTrash2 />
          </button>
        </div>
      </div>
      {event.description && <p className="event-description">{event.description}</p>}
      <p>
        ステータス: <span style={{ color: statusColor, fontWeight: 'bold' }}>{eventStatus}</span>
        {event.finalDate && ` (${new Date(event.finalDate).toLocaleDateString()})`}
        {event.lastMinuteWelcome && (
          <span style={{ color: '#dc3545', fontSize: '0.9em', marginLeft: '10px', fontWeight: 'bold' }}>
            ドタ参歓迎！
          </span>
        )}
        {event.finalDate && ( // Show unconfirm button only if date is confirmed
          <button onClick={handleUnconfirmDate} className="subtle-button">取り消し</button>
        )}
      </p>

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
  const [dates, setDates] = useState(event.dates.map(d => new Date(d)));
  const [lastMinuteWelcome, setLastMinuteWelcome] = useState(event.lastMinuteWelcome);
  const [description, setDescription] = useState(event.description || '');

  const handleDayPickerSelect = (selectedDays) => {
    if (selectedDays) {
      const formattedDates = Array.from(selectedDays).map(date => format(date, 'yyyy-MM-dd'));
      setDates(formattedDates);
    } else {
      setDates([]);
    }
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
          <div className="date-picker-container">
            <DayPicker
              mode="multiple"
              selected={dates} 
              onSelect={handleDayPickerSelect}
              showOutsideDays
              fixedWeeks
            />
            {dates.length > 0 && (
              <p>選択中の日程: {dates.map(d => format(d, 'yyyy-MM-dd')).sort().join(', ')}</p>
            )}
          </div>
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
