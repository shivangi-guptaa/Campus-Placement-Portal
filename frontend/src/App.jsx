import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Browse from "./pages/Browse";
import Profile from "./pages/Profile";
import JobDescription from "./components/JobDescription";
import Companies from "./components/admin/Companies";
import CompanyCreate from "./components/admin/CompanyCreate";
import CompanySetup from "./components/admin/CompanySetup";
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from "./components/admin/PostJob";
import Applicants from "./components/admin/Applicants";
import TpoDashboard from "./components/admin/TpoDashboard";
import RecruiterRoute from "./components/admin/RecruiterRoute";
import PrivateRoute from "./components/PrivateRoute";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/description/:id",
    element: <JobDescription />,
  },
  {
    path: "/browse",
    element: <Browse />,
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },

  // admin (recruiter & TPO) routes start
  {
    path: "/admin/tpo",
    element: (
      <RecruiterRoute>
        <TpoDashboard />
      </RecruiterRoute>
    ),
  },
  {
    path: "/admin/companies",
    element: (
      <RecruiterRoute>
        <Companies />
      </RecruiterRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <RecruiterRoute>
        <CompanyCreate />
      </RecruiterRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <RecruiterRoute>
        <CompanySetup />
      </RecruiterRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <RecruiterRoute>
        <AdminJobs />
      </RecruiterRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <RecruiterRoute>
        <PostJob />
      </RecruiterRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <RecruiterRoute>
        <Applicants />
      </RecruiterRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
