import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import "bootstrap/dist/css/bootstrap.min.css";
import CreateTest from "./pages/CreateTest";
import CreaterTestView from "./pages/CreaterTestView";
import ParticipatorTestView from "./components/Dashboard/Participator/ParticipatorTestView";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/createTest" element={<CreateTest />} />
        <Route path="/dashboard/test" element={<CreaterTestView />} />
        <Route path="/participator/test" element={<ParticipatorTestView />} />
        <Route path="/participator/test" element={<ParticipatorTestView />} />
      </Routes>
    </Router>
  );
}

export default App;
