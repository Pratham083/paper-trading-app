import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { STOCK_SYMBOLS } from "../../constants";

const SearchBar = () => {
  const navigate = useNavigate();
  const [symbols, setSymbols] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSymbols, setFilteredSymbols] = useState([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await api.get("/api/stock/all");
        if (res.status === 200) {
          setSymbols(res.data['stocks']);
          localStorage.setItem(STOCK_SYMBOLS, JSON.stringify(res.data['stocks']));
        }
        else {
          setSymbols([]);
          localStorage.removeItem(STOCK_SYMBOLS);
          console.log("Failed to fetch stock symbols", res.data);
        }
      } catch (error) {
        console.log("Failed to fetch stock symbols", error);
        localStorage.removeItem(STOCK_SYMBOLS);
        setSymbols([]);
      }
    };

    const cached = localStorage.getItem(STOCK_SYMBOLS);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSymbols(parsed);
        } else {
          throw new Error("Result is not an array or is empty");
        }
      } catch {
        localStorage.removeItem(STOCK_SYMBOLS);
        fetchSymbols();
      }
    } else {
      fetchSymbols();
    }
  }, []);

  useEffect(() => {
    const resultSize = 10;
    const term = searchTerm.toUpperCase();

    if (term === '') {
      setFilteredSymbols([]);
      return;
    }

    let filtered = symbols.filter(item =>
      item.symbol.toUpperCase().startsWith(term)
    );

    if (filtered.length < resultSize) {
      const secondary = symbols.filter(item =>
        item.company.toUpperCase().includes(term)
      );
      filtered = filtered.concat(secondary);
    }

    setFilteredSymbols(filtered.slice(0, resultSize));
  }, [searchTerm, symbols]);

  const submitSearch = (e) => {
    e.preventDefault();

    if (filteredSymbols.length > 0) {
      const symbol = filteredSymbols[0].symbol;
      navigate(`/chart/${symbol}`);
      setSearchTerm('');
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div className="relative max-w-sm w-full mx-auto">
      <form onSubmit={submitSearch} className="flex w-full">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          className="flex-grow px-3 py-2 border border-text rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-text rounded-r-lg hover:bg-primary-highlighted"
        >
          Search
        </button>
      </form>

      {filteredSymbols.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-secondary border border-text rounded-lg shadow-lg mt-1 z-50 text-text">
          {filteredSymbols.map(item => (
            <li key={item.symbol}>
              <Link
                to={`/chart/${item.symbol}`}
                onClick={() => setSearchTerm('')}
                className="block px-4 py-2 hover:bg-background"
              >
                <span className="font-bold">{item.symbol}</span> – {item.company}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showToast && (
        <div className="fixed right-4 top-1/3 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          No matching stocks found.
        </div>
      )}
    </div>
  );
};

export default SearchBar;
