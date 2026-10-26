import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginSelection from "../components/LoginSelection";
import UserRegister from "../components/UserRegister";
import OwnerRegister from "../components/OwnerRegister";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(location.state?.role || null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "owner") {
        navigate("/owner");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSelectRole = (selectedRole) => {
    setError("");
    setRole(selectedRole);
  };

  const handleRegisterSuccess = async (registerData) => {
    try {
      setError("");
      await register(registerData, registerData.role);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const msg = detail || (err.response ? "Unable to create the account. Please check your details and try again." : "Cannot reach the server. Please check your connection or try again in a few moments.");
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
          mode="register"
        />
      </div>
    );
  }

  if (role === "owner") {
    return (
      <div className="auth-page-wrap">
        <div className="auth-bg-blob blob-auth-1" aria-hidden="true"></div>
        <div className="auth-bg-blob blob-auth-2" aria-hidden="true"></div>
        <div className="register-page-wrap">
          <OwnerRegister
            onRegisterSuccess={handleRegisterSuccess}
            onBackToLogin={() => { setRole(null); setError(""); }}
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
      <div className="register-page-wrap">
        <UserRegister
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => { setRole(null); setError(""); }}
          serverError={error}
        />
      </div>
    </div>
  );
}
