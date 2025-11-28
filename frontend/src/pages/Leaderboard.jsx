import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../components/AuthContext/AuthContext";

export default function Leaderboard() {
  const { isAuthenticated } = useAuth();

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
    <div className="min-h-screen bg-background px-6 py-10 text-text">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Leaderboard</h1>

        {isAuthenticated && (
          <div className="text-center mb-6 text-lg">
            <span className="font-semibold">Your Rank: </span>
            {myRank ? `#${myRank}` : "Unranked / No portfolio"}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {users.map((item) => {
              const user = item.user;
              const totalValue = item.total_value;
              const deposited = user.portfolio.total_deposited;
              const net = deposited - totalValue;
              const percent = Math.round((net * 100) / deposited);

              return (
                <div
                  key={user.id}
                  className="bg-secondary p-5 rounded-xl shadow hover:shadow-lg transition"
                >
                  <div className="text-xl font-bold mb-2">#{item.rank} {user.username}</div>

                  <div className="text-text mb-1">
                    <span className="font-semibold">Portfolio Value: </span>
                    ${totalValue.toFixed(2)}
                  </div>

                  <div className="text-text">
                    <span className="font-semibold">All-Time Return: </span>
                    <span className={net >= -0.01 ? "text-green-500" : "text-red-500"}>
                      {net >= -0.01 ? "+" : "-"}${Math.abs(net).toFixed(2)} ({percent}%)
                    </span>
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
    </div>
  );
}
