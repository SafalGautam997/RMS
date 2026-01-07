import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { login } from "../store/slices/authSlice";
import { userQueries } from "../db/queries";
import ThemeSwitcher from "./ThemeSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCrown,
  faLock,
  faTriangleExclamation,
  faUser,
  faUserTie,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState<"admin" | "waiter" | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = await userQueries.login(
        username,
        password,
        "cafe and restaurents"
      );

      if (user && user.id) {
        dispatch(login(user));

        if (user.role === "Admin") {
          navigate("/admin");
        } else if (user.role === "Waiter") {
          navigate("/waiter");
        }
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-4xl relative z-10 border border-white/20">
        <div className="absolute top-6 right-6 text-gray-700">
          <ThemeSwitcher />
        </div>
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
            <span className="text-5xl text-white">
              <FontAwesomeIcon icon={faUtensils} />
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Restaurant Management
          </h1>
          <p className="text-gray-600 font-medium">
            Welcome back! Please select login type
          </p>
        </div>

        {!loginType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setLoginType("admin")}
              className="group p-8 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              <div className="text-6xl mb-4 text-purple-700">
                <FontAwesomeIcon icon={faCrown} />
              </div>
              <h2 className="text-2xl font-bold text-purple-700 mb-2">
                Admin Login
              </h2>
              <p className="text-gray-600">
                Access admin dashboard and management tools
              </p>
            </button>

            <button
              onClick={() => setLoginType("waiter")}
              className="group p-8 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              <div className="text-6xl mb-4 text-emerald-700">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                Waiter Login
              </h2>
              <p className="text-gray-600">
                Access waiter panel for order management
              </p>
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setLoginType(null);
                setError("");
                setUsername("");
                setPassword("");
              }}
              className="mb-6 text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition"
            >
              <span>
                <FontAwesomeIcon icon={faArrowLeft} />
              </span>
              <span>Back to selection</span>
            </button>

            <div className="text-center mb-6">
              <div
                className={`inline-block p-3 rounded-2xl mb-3 ${
                  loginType === "admin"
                    ? "bg-gradient-to-br from-purple-500 to-indigo-500"
                    : "bg-gradient-to-br from-emerald-500 to-teal-500"
                }`}
              >
                <span className="text-4xl text-white">
                  <FontAwesomeIcon
                    icon={loginType === "admin" ? faCrown : faUserTie}
                  />
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {loginType === "admin" ? "Admin Login" : "Waiter Login"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 animate-shake">
                  <span>
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                  </span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0 text-white ${
                  loginType === "admin"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                }`}
              >
                Sign In →
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
