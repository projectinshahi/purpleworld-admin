import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Layout } from "./components/Layout";
import { Spinner } from "./components/ui";
import { AuthProvider, useAuth } from "./lib/auth";
import { EnquiryCountsProvider } from "./lib/enquiryCounts";
import { Destinations } from "./pages/Destinations";
import { Enquiries } from "./pages/Enquiries";
import { Login } from "./pages/Login";
import { PackageForm } from "./pages/PackageForm";
import { Packages } from "./pages/Packages";
import "./index.css";

function RequireAuth({ children }: { children: ReactNode }) {
  const { admin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!admin) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: (
      <RequireAuth>
        <EnquiryCountsProvider>
          <Layout />
        </EnquiryCountsProvider>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/enquiries" replace /> },
      { path: "enquiries", element: <Enquiries /> },
      { path: "packages", element: <Packages /> },
      { path: "packages/new", element: <PackageForm /> },
      { path: "packages/:id", element: <PackageForm /> },
      { path: "destinations", element: <Destinations /> },
      { path: "*", element: <Navigate to="/enquiries" replace /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
