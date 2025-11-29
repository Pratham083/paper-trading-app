import { useAuth } from "../components/AuthContext/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Holding from "../components/Holding/Holding";
import api from "../api";
import { formatNumber } from "../utils";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const [allTime, setAllTime] = useState(false);

  const [user, setUser] = useState({
    holdings: [],
    username: "",
    balance: 0,
    total_deposited: 0,
    net: 0,
  });

  useEffect(() => {
    const getProfile = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get("/api/portfolio");
          const data = res.data;
          const portfolio = data.portfolio;

          setUser({
            username: data.username,
            balance: portfolio.balance,
            total_deposited: portfolio.total_deposited,
            net: getNet(portfolio),
            holdings: portfolio.holdings,
          });
        } catch (e) {
          console.log("Error fetching user profile", e.response?.data);
        }
      }
    };

    getProfile();
  }, [isAuthenticated]);
  const getNet = (portfolio) => {
    const holdings = portfolio.holdings;
    const balance = portfolio.balance;
    const total_deposited = portfolio.total_deposited;
    let assetValue = 0;
    holdings.forEach((holding) => {
      assetValue += (holding.quantity * holding.stock.last_sale);
    })
    return balance + assetValue - total_deposited;
  }
  const percent =user.total_deposited !== 0 ? (user.net * 100)/user.total_deposited: 0;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {isAuthenticated ? (
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary">
              Welcome, {user.username}!
            </h2>

            <h3 className="text-xl mt-4 text-text">
              Balance:{" "}
              <span className="font-semibold">${user.balance.toFixed(2)}</span>
            </h3>

            <h4 className="text-lg mt-2">
              <span className="text-text font-medium">Net: </span>
              <span
                className={`font-semibold ${
                  user.net >= -0.01 ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.net >= -0.01 ? "+" : "-"}$
                {Math.abs(user.net).toFixed(2)} ({formatNumber(percent)}%)
              </span>
            </h4>
          </div>

          {user.holdings.length > 0 && <div className="flex justify-end mb-4">
            <select
              value={allTime ? "all" : "daily"}
              onChange={(e) => setAllTime(e.target.value === "all")}
              className="
                bg-secondary 
                text-text 
                px-3 py-2 
                rounded-lg 
                shadow 
                border-none 
                focus:outline-none
              "
            >
              <option value="daily">Daily Return</option>
              <option value="all">All-Time Return</option>
            </select>
          </div>}

          <div className="space-y-4">
            {user.holdings.length === 0 && (
              <div className="text-center text-gray-500 italic">
                You do not own any stocks yet.
              </div>
            )}

            {user.holdings.map((holding) => {
              const holdingClean = {
                prev_close: holding.stock.prev_close,
                last_sale: holding.stock.last_sale,
                symbol: holding.stock.symbol,
                company: holding.stock.company,
                quantity: holding.quantity,
                book_cost: holding.book_cost
              };

              return (
                <Holding key={holding.id} allTime={allTime} {...holdingClean} />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text mb-6">
            Sign up to start paper trading!
          </h2>

          <Link
            to="/register"
            className="bg-primary text-text px-6 py-3 rounded-lg text-lg shadow hover:opacity-90 transition"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
