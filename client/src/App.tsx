import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TicketsList from './components/TicketsList';
import TicketForm from './components/TicketForm';

function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4 flex gap-4">
          <Link to="/" className="text-blue-600 hover:underline">Tickets List</Link>
          <Link to="/new" className="text-blue-600 hover:underline">Submit Ticket</Link>
        </nav>
        <Routes>
          <Route path="/" element={<TicketsList />} />
          <Route path="/new" element={<TicketForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
