import { useLocation, useNavigate } from "react-router-dom";
import Holding from "../components/Holding/Holding";
import { formatNumber } from "../utils";
import { useEffect } from "react";

function UserPortfolio() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {user} = location.state;

  if(!user) {
    navigate('/leaderboard');
  }
  
  const portfolio = user.portfolio;

  const getNet = (portfolio) => {
    const holdings = portfolio.holdings;
    const balance = portfolio.balance;
    const total_deposited = portfolio.total_deposited;
    let assetValue = 0;

    holdings.forEach((h) => {
      assetValue += h.quantity * h.stock.last_sale;
    });

    return balance + assetValue - total_deposited;
  };

  const net = getNet(portfolio);
  const percent =
    portfolio.total_deposited !== 0
      ? (net * 100) / portfolio.total_deposited
      : 0;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-primary">
            {user.username}'s Portfolio
          </h2>

          <h3 className="text-xl mt-4 text-text">
            Balance:{" "}
            <span className="font-semibold">
              ${portfolio.balance.toFixed(2)}
            </span>
          </h3>

          <h4 className="text-lg mt-2">
            <span className="text-text font-medium">Net: </span>
            <span
              className={`font-semibold ${
                net >= -0.01 ? "text-green-600" : "text-red-600"
              }`}
            >
              {net >= -0.01 ? "+" : "-"}${Math.abs(net).toFixed(2)} (
              {formatNumber(percent)}%)
            </span>
          </h4>
        </div>

        <div className="space-y-4">
          {portfolio.holdings.length === 0 && (
            <div className="text-center text-gray-500 italic">
              This user does not own any stocks.
            </div>
          )}

          {portfolio.holdings.map((holding) => {
            const holdingClean = {
              prev_close: holding.stock.prev_close,
              last_sale: holding.stock.last_sale,
              symbol: holding.stock.symbol,
              company: holding.stock.company,
              quantity: holding.quantity,
              book_cost: holding.book_cost,
            };

            return (
              <Holding
                key={holding.id}
                allTime={true}
                {...holdingClean}
              />
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-primary text-text px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPortfolio;
