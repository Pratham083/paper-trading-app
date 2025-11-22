import React, { useState, useEffect } from 'react';
import StockChart from '../components/StockChart/StockChart';
import StockForm from '../components/StockForm/StockForm';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function StockDetails() {
  const { symbol } = useParams();
  const [timeframe, setTimeframe] = useState('1d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/stock/historical/${symbol}?period=${timeframe}`);
        const stockData = res.data;

        if (!stockData.date || !stockData.price) {
          setData(null);
          setLoading(false);
          return;
        }

        const chartData = stockData.date.map((date, idx) => ({
          date,
          price: stockData.price[idx],
        }));

        setData(chartData);
        setLoading(false);
      } catch (e) {
        setData(null);
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe]);

  return (
    <div className="min-h-screen p-8 bg-background text-text">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          {loading && <p className="text-text text-lg">Loading chart data...</p>}
          {data && <StockChart data={data} timeframe={timeframe} />}
          {!loading && !data && <p className="text-text text-lg">No data available.</p>}
        </div>

        <div className="mb-4">
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className="
              w-40 
              text-text
              bg-secondary 
              rounded-lg 
              px-3 py-2 
              focus:outline-none 
              focus:ring-2 
              focus:ring-accent
            "
          >
            <option value="1d">1 Day</option>
            <option value="1wk">1 Week</option>
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="1y">1 Year</option>
            <option value="5y">5 Years</option>
          </select>
        </div>

        <div className="space-y-6">
          <div className="bg-background rounded-xl p-6 shadow-md">
            <StockForm stock={symbol} action="buy" />
          </div>

          <div className="bg-background rounded-xl p-6 shadow-md">
            <StockForm stock={symbol} action="sell" />
          </div>
        </div>

      </div>
    </div>
  );
}
