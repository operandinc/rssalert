import Error from "components/error";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

interface AlertResponse {
  alerts: {
    feedUrl: string;
    triggerId: string;
    destinationEmail: string;
    query: string;
  }[];
}

export default function Manage() {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [alertResponse, setAlertResponse] =
    React.useState<AlertResponse | null>(null);

  const fetchAlerts = async (email: string, secret: string) => {
    const response = await fetch(
      `/api/alert?emailAddress=${email}&emailSecret=${secret}`
    );
    if (response.ok) {
      setAlertResponse(await response.json());
    } else {
      setError(await response.text());
    }
  };

  React.useEffect(() => {
    if (router.query.email && router.query.secret) {
      fetchAlerts(router.query.email as string, router.query.secret as string);
    }
  }, [router.query]);

  const deleteAlert = async (triggerId: string) => {
    const response = await fetch(`/api/alert?triggerId=${triggerId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError(await response.text());
      return;
    }
    if (alertResponse) {
      setAlertResponse({
        ...alertResponse,
        alerts: alertResponse.alerts.filter((a) => a.triggerId !== triggerId),
      });
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 mx-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-gray-900">
          Manage your Alerts
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          From this secure page, you can see a list of your active alerts, and
          delete any that you no longer want to receive email notifications for.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {error != "" && (
              <Error message={error} onClose={() => setError("")} />
            )}
            {alertResponse == null ? (
              <div className="flex justify-center">
                <p className="text-center text-sm font-medium text-gray-700">
                  Loading... (are you sure you're using the right link?)
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {alertResponse.alerts.length == 0 ? (
                  <div className="flex justify-center">
                    <p className="text-center text-sm font-medium text-gray-700">
                      You don't have any active alerts!{" "}
                      <Link href="/">
                        <a className="underline cursor-pointer">Create One</a>
                      </Link>
                      .
                    </p>
                  </div>
                ) : (
                  alertResponse.alerts.map((alert) => (
                    <div key={alert.triggerId} className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {alert.query} ({alert.feedUrl})
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button
                          className="text-sm font-medium text-gray-700 bg-gray-100
                          hover:bg-gray-200 rounded-md px-4 py-2"
                          onClick={() => deleteAlert(alert.triggerId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
