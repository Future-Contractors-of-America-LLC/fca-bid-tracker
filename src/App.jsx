import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "fca_bids";
const DEFAULT_FORM = {
  company: "",
  value: "",
  status: "New",
};

function readStoredBids() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [bids, setBids] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    setBids(readStoredBids());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bids));
  }, [bids]);

  const addBid = () => {
    if (!form.company || !form.value) return;

    const newBid = {
      id: Date.now(),
      company: form.company,
      value: Number(form.value),
      status: form.status,
    };

    setBids((previous) => [...previous, newBid]);
    setForm(DEFAULT_FORM);
  };

  const updateStatus = (id, status) => {
    setBids((previous) => previous.map((bid) => (bid.id === id ? { ...bid, status } : bid)));
  };

  const totalPipeline = useMemo(() => bids.reduce((sum, bid) => sum + bid.value, 0), [bids]);
  const wonRevenue = useMemo(
    () => bids.filter((bid) => bid.status === "Won").reduce((sum, bid) => sum + bid.value, 0),
    [bids],
  );

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>FCA Bid Tracker</h1>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />

        <input
          placeholder="Value ($)"
          type="number"
          value={form.value}
          onChange={(event) => setForm({ ...form, value: event.target.value })}
        />

        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          <option>New</option>
          <option>Quoted</option>
          <option>Won</option>
          <option>Lost</option>
        </select>

        <button onClick={addBid}>Add Bid</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Total Pipeline:</strong> ${totalPipeline.toLocaleString()}
        <br />
        <strong>Won Revenue:</strong> ${wonRevenue.toLocaleString()}
      </div>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Company</th>
            <th>Value</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => (
            <tr key={bid.id}>
              <td>{bid.company}</td>
              <td>${bid.value.toLocaleString()}</td>
              <td>{bid.status}</td>
              <td>
                <select value={bid.status} onChange={(event) => updateStatus(bid.id, event.target.value)}>
                  <option>New</option>
                  <option>Quoted</option>
                  <option>Won</option>
                  <option>Lost</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
