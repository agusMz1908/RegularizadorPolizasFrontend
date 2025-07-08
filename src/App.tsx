import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoutes';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}

export default App;