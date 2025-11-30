import React, { useState, useEffect } from 'react';
import StockChart from '../components/StockChart/StockChart';
import StockForm from '../components/StockForm/StockForm';
import { useParams } from 'react-router-dom';
import { useAuth } from "../components/AuthContext/AuthContext";
import api from '../api';
import { formatNumber } from '../utils';

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
          <h1 className="text-5xl font-semibold tracking-tight">
            {symbol.toUpperCase()}
          </h1>

          {details && <h2 className="text-xl text-text/80 mt-1">
            {details.company}
          </h2>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

          <div className="lg:col-span-2">
            {loading && <p className="text-lg">Loading chart data...</p>}
            {data && <StockChart data={data} timeframe={timeframe} />}
            {!loading && !data && <p className="text-lg">No data available.</p>}

            <div className="mt-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-40 text-text bg-secondary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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

          <div className="bg-secondary rounded-xl p-6 shadow-md border border-secondary/20 max-w-[250px]">
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>
            <hr className="border-t border-gray-300 my-4" />

            {!details && <p>No details available.</p>}

            {details && (
              <div className="space-y-2">
                {[
                  {label:"Last Sale", value:`$${details.last_sale}` },
                  {label:"High", value:`$${details.high}` },
                  {label:"Low", value:`$${details.low}` },
                  {label:"Open", value: `$${details.open}` },
                  {label:"Prev Close", value: `$${details.prev_close}` },
                  {label:"P/E Ratio", value: formatNumber(details.pe_ratio)},
                  {label:"Yield", value: details.dividend_yield ? `${details.dividend_yield}%` : '-' },
                  {label:"Volume", value:formatNumber(details.volume, true) },
                  {label:"Market Cap", value:formatNumber(details.market_cap, true) },
                  {label:"Revenue", value:formatNumber(details.revenue, true) },
                  {label:"Debt", value: formatNumber(details.debt, true) },
                  {label:"Exchange", value: details.exchange ?? "-" },
                ].map((field) => (
                  <div key={field.label} className="flex justify-between">
                    <strong>{field.label}:</strong>
                    <span>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {holdings &&
          <div className="mt-6 bg-secondary rounded-xl p-6 shadow-md border border-secondary/20 w-[300px]">
            <h2 className="text-xl font-semibold mb-4">Holdings</h2>
              <hr className="border-t border-gray-300 my-4" />
              <div className="space-y-2 max-w-xs">
                {
                  [
                    {label: `${holdings.quantity} shares`, value:`$${formatNumber(holdings.total_value)}`},
                    {label: 'Book cost', value:`$${formatNumber(holdings.book_cost)}`},
                    {label: 'Average price', value:`$${formatNumber(holdings.avg_price)}`},
                  ].map((field) => (
                    <div key={field.label} className="flex justify-between">
                      <strong>{field.label}:</strong>
                      <span>{field.value}</span>
                    </div>
                  ))
                }
                <div key="Total return: " className="flex justify-between">
                  <strong>Total return: </strong>
                  <span className={`${holdings.total_value-holdings.book_cost > -0.01 ? "text-green-600" : "text-red-600"}`}>
                    ${formatNumber(holdings.total_value-holdings.book_cost)} ({formatNumber(100*(holdings.total_value-holdings.book_cost)/holdings.book_cost)})%
                  </span>
                </div>
              </div>
          </div>
        }

        {details &&
        <div className="mt-6 space-x-6 flex">
          <div className="bg-secondary rounded-xl p-6 shadow-md w-[300px]">
            <h2 className="text-xl font-semibold mb-4">Buy Shares</h2>
            <hr className="border-t border-gray-300 my-4" />
            <StockForm stock={details.id} action="buy" setHoldings={setHoldings} />
          </div>

          <div className="bg-secondary rounded-xl p-6 shadow-md w-[300px]">
              <h2 className="text-xl font-semibold mb-4">Sell Shares</h2>
              <hr className="border-t border-gray-300 my-4" />
            <StockForm stock={details.id} action="sell" setHoldings={setHoldings} />
          </div>
        </div>
        }
      </div>
    </div>
  );
}
