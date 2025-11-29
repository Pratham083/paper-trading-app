import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setNavigateToLogin } from './api'
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import StockDetails from './pages/StockDetails';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Account from './pages/Account';
import PortfolioView from './pages/PortfolioView';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigateToLogin(() => navigate('/login'))
  }, [navigate]);

  return (
    <>
      <Navbar />
      <Routes >
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/account" element={<Account />} />
        <Route path="/leaderboard" element={<Leaderboard />}/>
        <Route path="/portfolio/:username" element={<PortfolioView />}/>
        <Route path="/chart/:symbol" element={<StockDetails />} />
        <Route path="*" element={<NotFound/>}></Route>
      </Routes>
    </>
  );
}

export default App;
