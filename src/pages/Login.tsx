import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router";
import { Alert, Button, Field, Input } from "../components/ui";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Login() {
  const { admin, login } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (admin) {
    const from = (location.state as { from?: string } | null)?.from ?? "/enquiries";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await login(String(data.get("email")), String(data.get("password")));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-navy to-indigo p-4">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="Purpleworld Tours" className="mx-auto mb-8 h-28 w-auto" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl bg-white p-7 shadow-2xl">
          <div>
            <h1 className="font-display text-xl font-bold text-navy">Admin login</h1>
            <p className="mt-1 text-sm text-body">Manage packages, destinations and images.</p>
          </div>
          {error && <Alert>{error}</Alert>}
          <Field label="Email">
            <Input name="email" type="email" autoComplete="username" required autoFocus />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" autoComplete="current-password" required />
          </Field>
          <Button type="submit" loading={submitting} className="py-3">
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
