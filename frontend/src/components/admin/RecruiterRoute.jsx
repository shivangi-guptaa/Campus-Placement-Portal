import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RecruiterRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null || (user.role !== "recruiter" && user.role !== "tpo_admin")) {
      navigate("/");
    }
  }, [user, navigate]);

  return <>{children}</>;
};

export default RecruiterRoute;
