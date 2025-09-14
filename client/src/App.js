import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import EventSetup from './components/EventSetup';
import EventList from './components/EventList';
import EventPage from './components/EventPage'; // Import EventPage
import './App.css';

function App() {
  // This component will handle navigation after event creation
  const EventCreationRedirect = () => {
    const navigate = useNavigate();
    const handleEventCreated = ({ _id }) => {
      navigate(`/event/${_id}`);
    };
    return <EventSetup onEventCreated={handleEventCreated} />;
  };

  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>🍻 Drunk Scheduler 🍻</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/create" element={<EventCreationRedirect />} /> {/* Use EventCreationRedirect */}
            <Route path="/event/:id" element={<EventPage />} /> {/* Use EventPage */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;