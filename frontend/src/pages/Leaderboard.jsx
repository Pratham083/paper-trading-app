import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../components/AuthContext/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";

export default function Leaderboard() {
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/leaderboard?page=${page}&size=${size}`);
        const data = res.data;

        setUsers(data.top_users || []);
        setTotalPages(data.total_pages || 1);
        setMyRank(data.my_rank || null);
      } catch (e) {
        console.error("Failed to fetch leaderboard", e.response?.data);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [page]);

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  return (
    <div className="min-h-screen bg-background px-6 py-10 text-text flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-center">Leaderboard</h1>

      {isAuthenticated && (
        <div className="text-center mb-6 text-lg">
          <span className="font-semibold">Your Rank: </span>
          {myRank ? `#${myRank}` : "You are currently unranked. Check back tomorrow!"}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="w-full flex flex-col items-center gap-6 mb-10">
          {users.map((item) => {
            const user = item.user;
            const totalValue = item.total_value;
            const deposited = user.portfolio.total_deposited;
            const net = totalValue - deposited;
            const percent = Math.round((net * 100) / deposited);

            return (
              <div
                key={user.id}
                onClick={() => navigate(`/portfolio/${user.username}`, { state: { user } })}
                className="bg-secondary p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer w-full sm:w-[320px] md:w-[450px] flex justify-between items-start"
              >
                <div className="flex flex-col justify-between h-full">
                  <div className="text-xl font-bold">{`#${item.rank}`}</div>
                  <div className="text-lg font-semibold mt-auto">{user.username}</div>
                </div>

                <div className="flex flex-col text-right">
                  <div className="text-text mb-2">
                    <span className="font-semibold">Portfolio Value: </span>${totalValue.toFixed(2)}
                  </div>
                  <div className="text-text">
                    <span className="font-semibold">All-Time Return: </span>
                    <span className={net >= -0.01 ? "text-green-500" : "text-red-500"}>
                      {net >= -0.01 ? "+" : "-"}${Math.abs(net).toFixed(2)} ({percent}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={prevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-primary text-text rounded-lg disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-lg">Page {page} / {totalPages}</span>

        <button
          onClick={nextPage}
          disabled={page === totalPages}
          className="px-4 py-2 bg-primary text-text rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );

}
