import React, { useState } from "react";

// PUBLIC_INTERFACE
function AuthScreen({ onAuthSuccess, setGlobalError }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Switch between login/signup
  function switchMode() {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setFormError("");
  }

  // PUBLIC_INTERFACE
  async function handleAuth(e) {
    e.preventDefault();
    setFormError("");
    setGlobalError("");
    setLoading(true);
    try {
      const route = mode === "signup" ? "/auth/signup" : "/auth/login";
      const resp = await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"}${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await resp.json();
      if (resp.ok && data.token && data.user) {
        window.localStorage.setItem("ttt_token", data.token);
        onAuthSuccess(data.user, data.token);
      } else {
        setFormError(data.detail || "Authentication failed.");
      }
    } catch (err) {
      setGlobalError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleAuth}>
        <input
          autoFocus
          aria-label="Username"
          type="text"
          placeholder="Username"
          minLength={3}
          maxLength={16}
          disabled={loading}
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          aria-label="Password"
          type="password"
          placeholder="Password"
          minLength={3}
          maxLength={32}
          disabled={loading}
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        {formError && <div className="form-error">{formError}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>
      <div className="mode-switch">
        {mode === "login"
          ? <>New here? <button className="link-like" onClick={switchMode} disabled={loading}>Sign Up</button></>
          : <>Have an account? <button className="link-like" onClick={switchMode} disabled={loading}>Login</button></>}
      </div>
    </div>
  );
}

export default AuthScreen;
