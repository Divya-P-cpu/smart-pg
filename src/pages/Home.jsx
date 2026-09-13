import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeComponent from "../components/Home";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.role === "owner") {
      navigate("/owner", { replace: true });
    }
  }, [user, loading, navigate]);

  if (!loading && user?.role === "owner") {
    return null;
  }

  const handleNavigateToSearch = (filters) => {
    navigate("/explore", { state: filters });
  };

  const handleNavigateToLogin = (role) => {
    navigate("/login", { state: { role } });
  };

  return (
    <HomeComponent
      onNavigateToSearch={handleNavigateToSearch}
      onNavigateToLogin={handleNavigateToLogin}
    />
  );
}