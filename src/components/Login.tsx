
import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Login submitted!");
  };

  const handleForgotPassword = () => {
    alert("Please contact the administrator to reset your password.");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <span className="playr-icon">▦</span>
          <span>PLAYR</span>
        </div>

        <div className="login-label">MEMBER ACCESS</div>

        <h1>Welcome back.</h1>

        <p className="login-description">
          Sign in to manage your bookings and check club availability.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button">
            Sign In
          </button>

          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
