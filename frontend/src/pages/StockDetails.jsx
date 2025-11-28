import React, { useState, useEffect } from 'react';
import StockChart from '../components/StockChart/StockChart';
import StockForm from '../components/StockForm/StockForm';
import { useParams } from 'react-router-dom';
import { useAuth } from "../components/AuthContext/AuthContext";
import api from '../api';

export default function StockDetails() {
  const {isAuthenticated} = useAuth();
  const {symbol} = useParams();
  const [timeframe, setTimeframe] = useState('1d');
  const [data, setData] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [holdings, setHoldings] = useState(null);

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
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!symbol) return;
      try {
        const res = await api.get(`/api/stock/details/${symbol}`);
        setDetails(res.data);
      } catch (e) {
        setDetails(null);
      }
    };
    fetchDetails();
  }, [symbol]);

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!isAuthenticated || !details) return;

      try {
        const res = await api.get(`/api/holding/stock/${details.id}`);

        if (res.status === 200) {
          const holding = res.data.holding;
          setHoldings({
            'quantity':holding.quantity,
            'book_cost':holding.book_cost,
            'avg_price':holding.book_cost/holding.quantity,
            'total_value':holding.quantity*details.last_sale,
          });
        } else {
          setHoldings(null);
        }
      } catch (e) {
        setHoldings(null);
      }
    };
    fetchHoldings();
  }, [details, isAuthenticated]);

  return (
    <div className="min-h-screen p-8 bg-background text-text">
      <div className="max-w-6xl mx-auto">
    
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            {symbol.toUpperCase()}
          </h1>

          {details && <h2 className="text-lg text-text/70 mt-1">
            {details.company}
          </h2>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            {loading && <p className="text-lg">Loading chart data...</p>}
            {data && <StockChart data={data} timeframe={timeframe} />}
            {!loading && !data && <p className="text-lg">No data available.</p>}

            <div className="mt-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-40 text-text bg-secondary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="1d">1 Day</option>
                <option value="1wk">1 Week</option>
                <option value="1mo">1 Month</option>
                <option value="3mo">3 Months</option>
                <option value="1y">1 Year</option>
                <option value="5y">5 Years</option>
              </select>
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-6 shadow-md border border-secondary/20">
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>

            {!details && <p>No details available.</p>}

            {details && (
              <div className="space-y-2 text-sm">
                <p><strong>Exchange:</strong> {details.exchange ?? "N/A"}</p>
                <p><strong>Last Sale:</strong> ${details.last_sale}</p>
                <p><strong>High:</strong> ${details.high}</p>
                <p><strong>Low:</strong> ${details.low}</p>
                <p><strong>Open:</strong> ${details.open}</p>
                <p><strong>Prev Close:</strong> ${details.prev_close}</p>
                <p><strong>P/E Ratio:</strong> {details.pe_ratio}</p>
                <p><strong>Dividend Yield:</strong> {details.dividend_yield}</p>
                <p><strong>Volume:</strong> {details.volume?.toLocaleString()}</p>
                <p><strong>Market Cap:</strong> {details.market_cap?.toLocaleString()}</p>
                <p><strong>Revenue:</strong> {details.revenue?.toLocaleString()}</p>
                <p><strong>Debt:</strong> {details.debt?.toLocaleString()}</p>
                <p><strong>Sector:</strong> {details.sector ?? "N/A"}</p>
                <p><strong>Industry:</strong> {details.industry ?? "N/A"}</p>
                <p><strong>IPO Year:</strong> {details.ipo_year ?? "N/A"}</p>
              </div>
            )}
          </div>
        </div>
        {holdings &&
          <div className="bg-secondary rounded-xl p-6 shadow-md border border-secondary/20">
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>
              <div className="space-y-2 text-sm">
                <p><strong>{holdings.quantity} shares</strong> ${holdings.total_value}</p>
                <p><strong>Book cost:</strong> ${holdings.book_cost}</p>
                <p><strong>Average Price:</strong> ${holdings.avg_price}</p>
                <p><strong>Total return: </strong> 
                  ${holdings.total_value-holdings.book_cost} ({100*(holdings.total_value-holdings.book_cost)/holdings.book_cost})%
                </p>
              </div>
          </div>
        }

        {details &&
        <div className="mt-8 space-y-6">
          <div className="bg-secondary rounded-xl p-6 shadow-md">
            Buy Shares
            <StockForm stock={details.id} action="buy" setHoldings={setHoldings} />
          </div>

          <div className="bg-secondary rounded-xl p-6 shadow-md">
            Sell Shares
            <StockForm stock={details.id} action="sell" setHoldings={setHoldings} />
          </div>
        </div>
        }
      </div>
    </div>
  );
}
