import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import Consultation from '../components/Consultation';
import PatientSearch from '../components/PatientSearch';
import Cases from '../components/Cases';

export default function Portal() {
  const { doctor } = useAuth(); // ← get doctor from AuthContext directly
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app">
      <Header doctor={doctor} />
      <div className="body">
        <Sidebar page={page} onNavigate={setPage} />
        <div className="main">
          {page === 'dashboard'    && <Dashboard    doctor={doctor} />}
          {page === 'consultation' && <Consultation doctor={doctor} />}
          {page === 'patients'     && <PatientSearch doctor={doctor} />}
          {page === 'cases'        && <Cases />}
        </div>
      </div>
    </div>
  );
}