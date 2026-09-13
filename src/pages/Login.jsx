import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginSelection from "../components/LoginSelection";
import UserLogin from "../components/UserLogin";
import OwnerLogin from "../components/OwnerLogin";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(location.state?.role || null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "owner") {
        navigate("/owner");
      } else {
        navigate("/explore");
      }
    }
  }, [user, navigate]);

  const handleSelectRole = (selectedRole) => {
    setError("");
    setRole(selectedRole);
  };

  const handleLoginSuccess = async (loginData) => {
    try {
      setError("");
      await login(loginData.email, loginData.password, loginData.role);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(detail || (err.response ? "Unable to sign in. Check the selected account type, email, and password." : "Cannot reach the server. Please make sure the backend is running."));
    }
  };

  if (!role) {
    return (
      <div className="auth-page-wrap">
        <div className="auth-bg-blob blob-auth-1" aria-hidden="true"></div>
        <div className="auth-bg-blob blob-auth-2" aria-hidden="true"></div>
        <LoginSelection
          onSelectRole={handleSelectRole}
          onCancel={() => navigate("/")}
        />
      </div>
    );
  }

  if (role === "owner") {
    return (
      <div className="auth-page-wrap">
        <div className="auth-bg-blob blob-auth-1" aria-hidden="true"></div>
        <div className="auth-bg-blob blob-auth-2" aria-hidden="true"></div>
        <div className="login-page-wrap">
          <OwnerLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToSelection={() => setRole(null)}
            onGoToRegister={() => navigate("/register", { state: { role: "owner" } })}
          />
          {error && <div className="auth-error-banner glass-card" style={{ maxWidth: "400px", margin: "10px auto", padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "13px" }}><i className="fas fa-circle-exclamation"></i> {error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-bg-blob blob-auth-1" aria-hidden="true"></div>
      <div className="auth-bg-blob blob-auth-2" aria-hidden="true"></div>
      <div className="login-page-wrap">
        <UserLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToSelection={() => setRole(null)}
          onGoToRegister={() => navigate("/register", { state: { role: "user" } })}
        />
        {error && <div className="auth-error-banner glass-card" style={{ maxWidth: "400px", margin: "10px auto", padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "13px" }}><i className="fas fa-circle-exclamation"></i> {error}</div>}
      </div>
    </div>
  );
}
