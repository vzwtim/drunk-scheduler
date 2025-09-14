import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'; // Removed BrowserRouter
import EventSetup from './components/EventSetup';
import EventList from './components/EventList';
import EventPage from './components/EventPage';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // This component will handle navigation after event creation
  const EventCreationRedirect = () => {
    const innerNavigate = useNavigate();
    const handleEventCreated = ({ _id }) => {
      innerNavigate(`/event/${_id}`);
    };
    return <EventSetup onEventCreated={handleEventCreated} />;
  };

  // Determine if back button should be shown
  const showBackButton = location.pathname !== '/'; // Show if not on home page

  return (
    <div className="App">
      <header className="App-header">
        {showBackButton && (
          <button onClick={() => navigate(-1)} className="back-button-global">
            &#x2190; {/* Left arrow character */}
          </button>
        )}
        <h1>🍻 Drunk Scheduler 🍻</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/create" element={<EventCreationRedirect />} />
          <Route path="/event/:id" element={<EventPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
