import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../components/AuthContext/AuthContext";

function Login() {
  const { isAuthenticated, login } = useAuth();
  if (isAuthenticated) return <Navigate to="/" />;

  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        identifier,
        password,
      });

      if (res.status === 200) {
        login();
        setIdentifier('');
        setPassword('');
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        setError("Invalid credentials.");
      } else {
        setError("Server error. Try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-background px-4 pt-24">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-secondary/20"
      >
        <h2 className="text-2xl font-bold text-text mb-4">Login</h2>

        {error && <p className="mb-3 text-accent font-medium">{error}</p>}

        <input
          type="text"
          placeholder="Username or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="
            w-full px-4 py-2 mb-3 
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
            w-full px-4 py-2 mb-3 
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
        >Login</button>
        <p className="mt-4 text-text text-center">
          No account? <Link to="/register" className="text-primary underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
