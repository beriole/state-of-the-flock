import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Members from './pages/Members';
import Layout from './components/Layout';

import MemberForm from './pages/MemberForm';
import MemberDetail from './pages/MemberDetail';
import Bacenta from './pages/Bacenta';
import CallCenter from './pages/CallCenter';
import Attendance from './pages/Attendance';
import Governor from './pages/Governor';

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/members"
              element={
                <PrivateRoute>
                  <Members />
                </PrivateRoute>
              }
            />
            <Route
              path="/members/new"
              element={
                <PrivateRoute>
                  <MemberForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <PrivateRoute>
                  <MemberDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/members/:id/edit"
              element={
                <PrivateRoute>
                  <MemberForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/bacenta"
              element={
                <PrivateRoute>
                  <Bacenta />
                </PrivateRoute>
              }
            />
            <Route
              path="/calls"
              element={
                <PrivateRoute>
                  <CallCenter />
                </PrivateRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <PrivateRoute>
                  <Attendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/governor"
              element={
                <PrivateRoute>
                  <Governor />
                </PrivateRoute>
              }
            />
            {/* Autres routes à venir */}
          </Route>
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
