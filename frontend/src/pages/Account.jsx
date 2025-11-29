import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../components/AuthContext/AuthContext";
import { formatMarshmallowError } from "../utils";

const Account = () => {
  const { isAuthenticated, setAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get("/api/portfolio");
        setUserData({
          username: res.data.username,
          email: res.data.email,
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && !currentPassword) {
      setError("Current password is required to change password.");
      return;
    }

    try {
      const payload = {
        username: userData.username,
        email: userData.email,
      };
      if (newPassword) {
        payload.new_password = newPassword;
        payload.current_password = currentPassword;
      }

      const res = await api.put("/auth/account/update", payload);
      if (res.status === 200) {
        setSuccess("Account updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        const errors = err.response?.data?.error;
        setError(formatMarshmallowError(errors));
      }
      else {
        setError("Server error.");
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      const res = await api.delete("/auth/account/delete");
      if (res.status === 200) {
        setAuthenticated(false);
        navigate("/register");
      }
    } catch (err) {
      setError("Failed to delete account.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-background px-4 pt-24">
      <form 
        onSubmit={handleUpdate}
        className="w-full max-w-sm bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-secondary/20"
      >
        <h2 className="text-2xl font-bold text-text mb-4">Account Settings</h2>

        {error && <p className="mb-3 text-accent whitespace-pre-line font-medium">{error}</p>}
        {success && <p className="mb-3 text-green-600 font-medium">{success}</p>}

        <input
          type="text"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          className="w-full px-4 py-2 mb-5 bg-background text-text border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="email"
          placeholder="Email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          className="w-full px-4 py-2 mb-5 bg-background text-text border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-2 mb-5 bg-background text-text border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 mb-5 bg-background text-text border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          className="w-full px-4 py-2 mb-3 bg-primary text-text rounded-lg font-semibold hover:bg-primary-highlighted transition"
        >
          Update Account
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-600 text-text rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </form>
    </div>
  );
};

export default Account;
