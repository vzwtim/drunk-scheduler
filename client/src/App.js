import React, { useState, useEffect } from 'react';
import './App.css';
import EventSetup from './components/EventSetup';
import Vote from './components/Vote';
import Results from './components/Results';

function App() {
  const [event, setEvent] = useState(null);

  // アプリ起動時に既存のイベント情報を取得
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        }
      } catch (error) {
        // バックエンドがまだ起動していない場合などのエラーは無視
        console.log('No existing event found.');
      }
    };
    fetchEvent();
  }, []);

  const handleEventCreated = (eventData) => {
    setEvent(eventData);
  };

  const handleVoted = (updatedEventData) => {
    setEvent(updatedEventData);
  };

  const handleEdit = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/events', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('サーバーからのエラーレスポンス:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`イベントのリセットに失敗しました。(Status: ${response.status})`);
      }

      setEvent(null);
      alert('イベントをリセットしました。');

    } catch (error) {
      console.error('リセット処理中にエラーが発生しました:', error);
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <h1>飲み会日程調整アプリ</h1>
      {!event ? (
        <EventSetup onEventCreated={handleEventCreated} />
      ) : (
        <>
          <Vote event={event} onVoted={handleVoted} onEdit={handleEdit} />
          <Results event={event} />
        </>
      )}
    </div>
  );
}

export default App;
