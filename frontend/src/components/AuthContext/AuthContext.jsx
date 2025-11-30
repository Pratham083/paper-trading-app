import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  //call auth when app loads
  useEffect(() => {
    auth()
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setIsAuthenticated(false);
    navigate('/login');
  };

  //ask backend if token cookie is valid
  const auth = async () => {
    try {
      const res = await api.get("/auth/check");
      setIsAuthenticated(res.data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
   return useContext(AuthContext);
};
