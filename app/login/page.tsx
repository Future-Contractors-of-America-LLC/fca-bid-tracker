"use client";

import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  function handleLogin() {
    router.push("/dashboard");
  }

  return (
    <div>
      <h2>Login to FCA</h2>

      <input placeholder="Email" />
      <br /><br />

      <input type="password" placeholder="Password" />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
