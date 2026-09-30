import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { subscribeToAuth } from "../firebase/auth.js";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => subscribeToAuth(setUser), []);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
