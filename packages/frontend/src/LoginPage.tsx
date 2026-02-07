import { useId } from "react";
import { useActionState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ import useNavigate
import "./LoginPage.css";

interface LoginPageProps {
  isRegistering?: boolean;
  setAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

interface FormState {
  error?: string;
}

async function loginUser(
  username: string,
  password: string,
  setAuthToken: React.Dispatch<React.SetStateAction<string>>,
  navigate: (path: string) => void
): Promise<FormState> {
  const response = await fetch("https://api.apiforslocialism.org/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const body = await response.json();
  if (!response.ok) {
    return { error: body.error || "Login failed" };
  }

  const token = body.token ?? body;
  console.log("✅ Auth token:", token);
  setAuthToken(token);
  localStorage.setItem("authToken", token);
  localStorage.setItem("Username", username);
  navigate("/"); // ✅ redirect to homepage
  window.location.reload();
  return {};
}

async function handleAuthForm(
  _prevState: FormState,
  formData: FormData,
  isRegistering: boolean,
  props: LoginPageProps,
  navigate: (path: string) => void
): Promise<FormState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (isRegistering) {
    try {
      const registerRes = await fetch("https://api.apiforslocialism.org/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const registerBody = await registerRes.json();
      if (!registerRes.ok) {
        return { error: registerBody.error || "Registration failed" };
      }

      console.log("✅ Successfully created account, logging in...");
      return await loginUser(username, password, props.setAuthToken, navigate);
    } catch (err) {
      return { error: "Network error during registration" };
    }
  } else {
    try {
      return await loginUser(username, password, props.setAuthToken, navigate);
    } catch (err) {
      return { error: "Network error during login" };
    }
  }
}

export function LoginPage(props: LoginPageProps) {
  const { isRegistering = false } = props;
  const usernameInputId = useId();
  const passwordInputId = useId();
  const navigate = useNavigate(); // ✅ hook from React Router

  const formHandler = (prevState: FormState, formData: FormData) =>
    handleAuthForm(prevState, formData, isRegistering, props, navigate);

  const [state, formAction, isPending] = useActionState(formHandler, { error: undefined });

  return (
    <>
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
      <form className="LoginPage-form" action={formAction}>
        <label htmlFor={usernameInputId}>Username</label>
        <input
          id={usernameInputId}
          name="username"
          required
          disabled={isPending}
        />

        <label htmlFor={passwordInputId}>Password</label>
        <input
          id={passwordInputId}
          type="password"
          name="password"
          required
          disabled={isPending}
        />

        <input
          type="submit"
          value="Submit"
          disabled={isPending}
        />

        {state.error && (
          <p style={{ color: "red" }} aria-live="polite">
            {state.error}
          </p>
        )}
      </form>

      {!isRegistering && (
        <p>
          Don’t have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>
      )}
    </>
  );
}
