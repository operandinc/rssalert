import Error from "components/error";
import * as React from "react";

interface LoginForm {
  emailAddress: string;
}

export default function Login() {
  const [form, setForm] = React.useState<LoginForm>({
    emailAddress: "",
  });
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const didSubmit = async () => {
    if (form.emailAddress.length === 0) {
      setError("Please enter an email address.");
      return;
    }
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setSuccess(true);
    } else {
      setError(await response.text());
    }
  };

  // If we're successful, show a success message.
  if (success) {
    return (
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 mx-4">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div>
                <p className="text-center text-sm font-medium text-gray-700">
                  Success! You should receive an email shortly if you've
                  previously created any alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 mx-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-gray-900">
          Manage your Alerts
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          After clicking "Login", you'll be sent a secure link to manage your
          active alerts. From there, you can delete any existing alerts.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {error != "" && (
              <Error message={error} onClose={() => setError("")} />
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Your Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="hello@example.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.emailAddress}
                  onChange={(e) =>
                    setForm((existing) => ({
                      ...existing,
                      emailAddress: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8100B4] hover:shadow-md"
                onClick={didSubmit}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
