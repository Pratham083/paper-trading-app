import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-secondary text-text px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center gap-4">

        <Link to="/" className="text-2xl font-bold tracking-wide">
          Home
        </Link>

        <div className="flex-grow max-w-xl">
          <SearchBar />
        </div>

        <div className="flex items-center gap-6 text-text">
          <Link to="/" className="hover:text-primary transition">Portfolio</Link>
          <Link to="/leaderboard" className="hover:text-primary transition">Leaderboard</Link>
          <Link to="/account" className="hover:text-primary transition">Account</Link>
        </div>

        {isAuthenticated ? (
          <button
            onClick={logout}
            className="ml-4 px-4 py-2 bg-primary hover:bg-primary-highlighted rounded-md font-medium text-text"
          >
            Log Out
          </button>
        ) : (
          <Link
            to="/login"
            className="ml-4 px-4 py-2 bg-primary hover:bg-primary-highlighted rounded-md font-medium text-text"
          >
            Login
          </Link>
        )}
      </div>
    </nav>

  );
};

export default Navbar;
