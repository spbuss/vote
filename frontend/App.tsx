import React, { useState } from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("pulse_auth") === "true"
  );

  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailAuth = () => {
    // TEMP AUTH (backend will replace this)
    if (!email || !password) {
      alert("Email & password required");
      return;
    }

    if (isSignupMode && (!name || !username)) {
      alert("Name & username required");
      return;
    }

    localStorage.setItem("pulse_auth", "true");
    setIsAuthenticated(true);
  };

  const renderAuthScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow space-y-4">
        <h1 className="text-2xl font-bold text-center">
          {isSignupMode ? "Create your Pulse account" : "Welcome to Pulse"}
        </h1>

        {/* OAUTH BUTTONS (UI ONLY) */}
        <button className="w-full h-12 rounded-xl bg-black text-white font-semibold">
          Continue with Google
        </button>
        <button className="w-full h-12 rounded-xl border font-semibold">
          Continue with Apple
        </button>

        {/* EMAIL BUTTON */}
        <button
          onClick={() => setShowEmailAuth(!showEmailAuth)}
          className="w-full h-12 rounded-xl border font-semibold"
        >
          Continue with Email
        </button>

        {/* EMAIL FORM */}
        {showEmailAuth && (
          <div className="space-y-3 pt-2">
            {isSignupMode && (
              <>
                <input
                  placeholder="Full Name"
                  className="w-full h-11 px-3 border rounded-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  placeholder="Username"
                  className="w-full h-11 px-3 border rounded-lg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </>
            )}

            <input
              placeholder="Email"
              type="email"
              className="w-full h-11 px-3 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Password"
              type="password"
              className="w-full h-11 px-3 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleEmailAuth}
              className="w-full h-12 rounded-xl bg-indigo-600 text-white font-bold"
            >
              {isSignupMode ? "Create Account" : "Login"}
            </button>
          </div>
        )}

        {/* TOGGLE LOGIN / SIGNUP */}
        <p className="text-center text-sm text-gray-600">
          {isSignupMode ? "Already have an account?" : "New to Pulse?"}{" "}
          <button
            onClick={() => {
              setIsSignupMode(!isSignupMode);
              setShowEmailAuth(false);
            }}
            className="text-indigo-600 font-semibold"
          >
            {isSignupMode ? "Login" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );

  const renderApp = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Pulse Feed</h1>
      <p className="text-gray-600">You are logged in 🎉</p>

      <button
        onClick={() => {
          localStorage.removeItem("pulse_auth");
          setIsAuthenticated(false);
        }}
        className="mt-4 text-red-600 font-semibold"
      >
        Logout
      </button>
    </div>
  );

  return isAuthenticated ? renderApp() : renderAuthScreen();
}
