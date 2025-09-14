import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'; // Removed BrowserRouter
import EventSetup from './components/EventSetup';
import EventList from './components/EventList';
import EventPage from './components/EventPage';
import './App.css';

function App() {
  const onEventCreated = (newEvent) => {
    // Navigate to the new event's page
    navigate(`/event/${newEvent._id}`);
  };

  return (
    <Router>
      <div className="App">
        <div className="bubbles-container">
          {[...Array(15)].map((_, i) => <div className="bubble" key={i} />)}
        </div>
        <header className="App-header">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Drunk Scheduler</h1>
          </Link>
        </header>

export default App;
