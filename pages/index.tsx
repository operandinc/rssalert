import Error from "components/error";
import Link from "next/link";
import * as React from "react";

interface RSSAlertForm {
  feedUrl: string;
  triggerQuery: string;
  triggerThreshold: number;
  destinationEmail: string;
}

// todo: fix triggers (debug), otherwise should be working? some filter thing i think

export default function Index() {
  const [form, setForm] = React.useState<RSSAlertForm>({
    feedUrl: "",
    triggerQuery: "",
    triggerThreshold: 0.45,
    destinationEmail: "",
  });
  const [triggerId, setTriggerId] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const didSubmit = async () => {
    if (form.feedUrl.length === 0) {
      setError("Please enter a feed URL.");
      return;
    } else if (form.triggerQuery.length === 0) {
      setError("Please enter a trigger query.");
      return;
    } else if (form.destinationEmail.length === 0) {
      setError("Please enter a destination email.");
      return;
    } else if (form.triggerThreshold < 0.4 || form.triggerThreshold > 1) {
      setError("Please enter a valid trigger threshold (between 0.4 and 1).");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const rbody = (await response.json()) as {
        triggerId: string;
      };
      setTriggerId(rbody.triggerId);
    } else {
      setError(await response.text());
    }

    setForm((existing) => ({
      ...existing,
      triggerQuery: "",
      triggerThreshold: 0.45,
    }));

    setLoading(false);
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 mx-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-gray-900">
          Create an Alert
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Get notified by email when semantically-matching content is found in
          an RSS feed. And yes, it's easy to unsubscribe from alerts.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <p className="text-center text-sm font-medium text-gray-700">
                    Creating your alert...
                  </p>
                </div>
              </div>
            ) : triggerId !== "" ? (
              <>
                <div>
                  <p className="text-center text-gray-900">
                    Success! You will be notified via email whenever new content
                    from this RSS feed matches your query (above the given
                    matching threshold).
                  </p>
                </div>
                <div className="mt-6 flex space-between justify-center gap-4">
                  <button
                    type="submit"
                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8100B4] hover:shadow-md"
                    onClick={() => setTriggerId("")}
                  >
                    Create Another Alert
                  </button>
                </div>
              </>
            ) : (
              <>
                {error != "" && (
                  <Error message={error} onClose={() => setError("")} />
                )}
                <div>
                  <label
                    htmlFor="feed-url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    RSS Feed URL
                  </label>
                  <div className="mt-1">
                    <input
                      id="feed-url"
                      type="url"
                      autoComplete="off"
                      placeholder="https://tailscale.com/blog/index.xml"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={form.feedUrl}
                      onChange={(e) =>
                        setForm((existing) => ({
                          ...existing,
                          feedUrl: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
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
                      value={form.destinationEmail}
                      onChange={(e) =>
                        setForm((existing) => ({
                          ...existing,
                          destinationEmail: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="query"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Idea / Concept to Match
                  </label>
                  <div className="mt-1">
                    <input
                      id="query"
                      type="text"
                      autoComplete="off"
                      placeholder="JSONMutexDB"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={form.triggerQuery}
                      onChange={(e) =>
                        setForm((existing) => ({
                          ...existing,
                          triggerQuery: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="threshold"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Matching Threshold (0.4 - 1.0)
                  </label>
                  <div className="mt-1">
                    <input
                      id="threshold"
                      type="number"
                      autoComplete="off"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={form.triggerThreshold}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setForm((existing) => ({
                          ...existing,
                          triggerThreshold: value,
                        }));
                      }}
                      step="0.1"
                      max={1}
                      min={0.4}
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8100B4] hover:shadow-md"
                    onClick={didSubmit}
                  >
                    Create Alert
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-center">
          <p className="text-sm text-gray-600">
            Have questions?{" "}
            <Link href="/faq">
              <a className="underline cursor-pointer">Read the FAQ</a>
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
