import { createBrowserRouter } from "react-router-dom";
import PhysiotherapyWorkflowPage from "../pages/PhysiotherapyWorkflowPage";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <PhysiotherapyWorkflowPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/login",
    element: <LoginPage />
  }
]);
