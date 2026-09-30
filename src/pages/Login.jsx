import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm.jsx";
import { subscribeToAuth } from "../firebase/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);

  useEffect(() => subscribeToAuth(setUser), []);

  if (user === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>;
  }
  if (user) return <Navigate to="/" replace />; // already logged in

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold">Payment Records</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">Log in to manage your records.</p>
        <LoginForm onSuccess={() => navigate("/", { replace: true })} />
      </div>
    </div>
  );
}
