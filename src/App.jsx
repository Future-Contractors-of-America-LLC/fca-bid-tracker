import { useState, useEffect } from "react";

export default function App() {
  const [bids, setBids] = useState([]);

  const [form, setForm] = useState({
    company: "",
    value: "",
    status: "New",
  });

  // Load from browser storage
  useEffect(() => {
    const saved = localStorage.getItem("fca_bids");
    if (saved) {
      setBids(JSON.parse(saved));
    }
  }, []);

  // Save to browser storage
  useEffect(() => {
    localStorage.setItem("fca_bids", JSON.stringify(bids));
  }, [bids]);

  const addBid = () => {
    if (!form.company || !form.value) return;

    const newBid = {
      id: Date.now(),
      company: form.company,
      value: Number(form.value),
      status: form.status,
    };

    setBids([...bids, newBid]);

    setForm({
      company: "",
      value: "",
      status: "New",
    });
  };

  const totalPipeline = bids.reduce((sum, b) => sum + b.value, 0);
  const wonRevenue = bids
    .filter((b) => b.status === "Won")
    .reduce((sum, b) => sum + b.value, 0);

  const updateStatus = (id, status) => {
    setBids(
      bids.map((b) =>
        b.id === id ? { ...b, status: status } : b
      )
    );
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>FCA Bid Tracker</h1>

      {/* INPUT FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) =>
            setForm({ ...form, company: e.target.value })
          }
        />

        <input
          placeholder="Value ($)"
          type="number"
          value={form.value}
          onChange={(e) =>
            setForm({ ...form, value: e.target.value })
          }
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option>New</option>
          <option>Quoted</option>
          <option>Won</option>
          <option>Lost</option>
        </select>

        <button onClick={addBid}>Add Bid</button>
      </div>

      {/* METRICS */}
      <div style={{ marginBottom: 20 }}>
        <strong>Total Pipeline:</strong> ${totalPipeline.toLocaleString()}
        <br />
        <strong>Won Revenue:</strong> ${wonRevenue.toLocaleString()}
      </div>

      {/* TABLE */}
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
                <select
                  value={bid.status}
                  onChange={(e) =>
                    updateStatus(bid.id, e.target.value)
                  }
                >
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
