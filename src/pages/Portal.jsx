import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Consultation from "../components/Consultation";
import Records from "../components/Records";
import Cases from "../components/Cases";
import MyPatients from "./MyPatients";
import DoctorSearch from "./DoctorSearch";
import PatientSearch from "./PatientSearch";

export default function Portal() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("consultation");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderPage = () => {
    if (activePage === "consultation") return <Consultation />;
    if (activePage === "records") return <Records />;
    if (activePage === "cases") return <Cases />;
    if (activePage === "mypatients") return <MyPatients />;
    if (activePage === "doctorsearch") return <DoctorSearch />;
    if (activePage === "patientsearch") return <PatientSearch />;
  };

  return (
    <div className="app">
      <Header onLogout={handleLogout} />
      <div className="body">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="main">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}