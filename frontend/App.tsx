import { useState, useEffect } from "react";

const API = "https://YOUR_BACKEND_URL/api";

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<any>(null);

  const [isSignup, setIsSignup] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const url = isSignup ? "/auth/signup" : "/auth/login";

    const res = await fetch(API + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-3">
          <h2 className="text-xl font-bold">
            {isSignup ? "Create Account" : "Login"}
          </h2>

          <button
            onClick={() => setShowEmail(true)}
            className="w-full border h-11 rounded"
          >
            Continue with Email
          </button>

          {showEmail && (
            <>
              {isSignup && (
                <>
                  <input name="name" placeholder="Name" onChange={handleChange} className="input" />
                  <input name="username" placeholder="Username" onChange={handleChange} className="input" />
                </>
              )}
              <input name="email" placeholder="Email" onChange={handleChange} className="input" />
              <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input" />
              <button onClick={submit} className="w-full bg-indigo-600 text-white h-11 rounded">
                {isSignup ? "Sign up" : "Login"}
              </button>
            </>
          )}

          <p className="text-sm text-center">
            {isSignup ? "Already have account?" : "New here?"}
            <button onClick={() => setIsSignup(!isSignup)} className="ml-1 text-indigo-600">
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return <Profile user={user} logout={() => {
    localStorage.removeItem("token");
    setToken(null);
  }} />;
}
