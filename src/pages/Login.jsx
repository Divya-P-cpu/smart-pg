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
  const [initialEmail, setInitialEmail] = useState(location.state?.email || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      const returnTo = location.state?.returnTo;
      if (returnTo) {
        navigate(returnTo);
      } else if (user.role === "owner") {
        navigate("/owner");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate, location.state]);

  const handleSelectRole = (selectedRole) => {
    setError("");
    setRole(selectedRole);
  };

  const handleSwitchRole = (newRole, emailToKeep = "") => {
    setError("");
    if (emailToKeep) {
      setInitialEmail(emailToKeep);
    }
    setRole(newRole);
  };

  const handleLoginSuccess = async (loginData) => {
    try {
      setError("");
      await login(loginData.email, loginData.password, loginData.role);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const msg = detail || (err.response ? "Unable to sign in. Check the selected account type, email, and password." : "Cannot reach the server. Please check your connection or try again in a few moments.");
      setError(msg);
      throw err;
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
            onBackToSelection={() => { setRole(null); setError(""); }}
            onGoToRegister={() => navigate("/register", { state: { role: "owner" } })}
            onSwitchRole={handleSwitchRole}
            initialEmail={initialEmail}
            serverError={error}
          />
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
          onBackToSelection={() => { setRole(null); setError(""); }}
          onGoToRegister={() => navigate("/register", { state: { role: "user" } })}
          onSwitchRole={handleSwitchRole}
          initialEmail={initialEmail}
          serverError={error}
        />
      </div>
    </div>
  );
}
