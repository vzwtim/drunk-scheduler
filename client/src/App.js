import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import EventSetup from './components/EventSetup';
import EventList from './components/EventList';
import EventPage from './components/EventPage';
import './App.css';

// AppContent contains the logic that needs access to the navigate function.
function AppContent() {
  const navigate = useNavigate();

  const onEventCreated = (newEvent) => {
    // Navigate to the new event's page after creation
    navigate(`/event/${newEvent._id}`);
  };

  return (
    <div className="App">
      <div className="bubbles-container">
        {[...Array(15)].map((_, i) => <div className="bubble" key={i} />)}
      </div>
      <header className="App-header">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Drunk Scheduler</h1>
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/create" element={<EventSetup onEventCreated={onEventCreated} />} />
          <Route path="/event/:id" element={<EventPage />} />
        </Routes>
      </main>
    </div>
  );
}

// The main App component wraps the content with the Router.
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;