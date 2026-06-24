import { useEffect, useState } from "react";
import { fetchLeadsNextActions } from "../api/leadsClient";
import useCustomerSession from "./useCustomerSession";

export default function useLeadsNextActions() {
  const { session } = useCustomerSession();
  const userId = session?.email || session?.customerId || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.authenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    fetchLeadsNextActions()
      .then((payload) => setItems(payload.items || []))
      .catch((loadError) => {
        setItems([]);
        setError(loadError.message || "Unable to load leads next actions.");
      })
      .finally(() => setLoading(false));
  }, [session?.authenticated, userId]);

  const topAction = items[0] || null;

  return {
    items,
    topAction,
    loading,
    error,
    hasActions: items.length > 0,
  };
}
