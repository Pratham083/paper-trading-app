import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../components/AuthContext/AuthContext";

function Register() {
  const { isAuthenticated, setAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" />;

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      if(res.status===201) {
        setUsername('');
        setEmail('');
        setPassword('');
        navigate("/login");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Server error.");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-background px-4 pt-24">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-secondary/20"
      >
        <h2 className="text-2xl font-bold text-text mb-4">Register</h2>

        {error && <p className="mb-3 text-accent font-medium">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="
            w-full px-4 py-2 mb-5
            bg-background text-text 
            border border-secondary rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary
          "
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            w-full px-4 py-2 mb-5
            bg-background text-text 
            border border-secondary rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary
          "
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full px-4 py-2 mb-5
            bg-background text-text 
            border border-secondary rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary
          "
        />

        <button type="submit"
          className="
            w-full px-4 py-2
            bg-primary text-text 
            rounded-lg font-semibold 
            hover:bg-primary-highlighted 
            transition
          "
        >Create Account</button>
        <p className="mt-4 text-text text-center">
          Already have an account? <Link to="/login" className="text-primary underline">Login</Link>
        </p>
      </form>

    </div>
  );
}

export default Register;
