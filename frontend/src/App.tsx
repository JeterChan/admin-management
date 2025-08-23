import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import OrderManagement from './components/OrderManagement';
import './App.css';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <OrderManagement />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
