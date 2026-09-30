import { useState } from "react";
import { login } from "../firebase/auth.js";

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err) {
      const credentialErrors = [
        "auth/invalid-credential",
        "auth/wrong-password",
        "auth/user-not-found",
        "auth/invalid-email",
      ];
      if (credentialErrors.includes(err.code)) setError("Invalid email or password.");
      else if (err.code === "auth/too-many-requests")
        setError("Too many attempts. Please wait a moment and try again.");
      else if (err.code === "auth/network-request-failed")
        setError("Network error. Check your connection and try again.");
      else setError("Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" type="email" required autoComplete="email" className="input"
          value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="password" type="password" required autoComplete="current-password" className="input"
          value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
