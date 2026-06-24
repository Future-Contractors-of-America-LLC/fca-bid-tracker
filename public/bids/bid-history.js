/**
 * Phase 1N — Auricrux action history per bid.
 * Stored in bid.actionHistory (array, newest-first).
 * Appended on every POST upsert via edit.html.
 */
(function (global) {

  var ACTION_ICONS = {
    created:           "✦",
    edited:            "✎",
    status_changed:    "⇄",
    checklist_updated: "☑",
    auricrux_scored:   "⚡",
  };

  var ACTION_LABELS = {
    created:           "Bid created",
    edited:            "Bid edited",
    status_changed:    "Status changed",
    checklist_updated: "Checklist updated",
    auricrux_scored:   "Auricrux scored",
  };

  /**
   * Build a new history entry object.
   * @param {string} type  - one of the ACTION_LABELS keys
   * @param {string} label - human-readable summary (falls back to ACTION_LABELS[type])
   * @param {string[]} changes - list of "field: old → new" strings (may be empty)
   * @returns {object}
   */
  function buildEntry(type, label, changes) {
    return {
      ts:      new Date().toISOString(),
      type:    type || "edited",
      label:   label || ACTION_LABELS[type] || "Updated",
      changes: Array.isArray(changes) ? changes : [],
    };
  }

  /**
   * Return a new array with the entry prepended (newest-first).
   * Caps at 50 entries to keep bid payloads bounded.
   * @param {object[]} existing - current actionHistory array (may be null/undefined)
   * @param {object}   entry    - entry from buildEntry()
   * @returns {object[]}
   */
  function prependEntry(existing, entry) {
    var history = Array.isArray(existing) ? existing.slice() : [];
    history.unshift(entry);
    if (history.length > 50) history = history.slice(0, 50);
    return history;
  }

  /**
   * Detect field-level changes between an original bid and form values.
   * @param {object} original - the bid object before edits
   * @param {object} updated  - the object built from the form (readForm output)
   * @returns {string[]} array of "Field: old → new" strings
   */
  function detectChanges(original, updated) {
    var TRACKED = [
      { key: "status",       label: "Status" },
      { key: "value",        label: "Value",        format: currency },
      { key: "company",      label: "Company" },
      { key: "projectName",  label: "Project name" },
      { key: "trade",        label: "Trade" },
      { key: "location",     label: "Location" },
      { key: "contactName",  label: "Contact" },
      { key: "contactEmail", label: "Email" },
      { key: "notes",        label: "Notes",        truncate: true },
    ];

    var diffs = [];
    TRACKED.forEach(function (field) {
      var oldVal = String(original[field.key] != null ? original[field.key] : "");
      var newVal = String(updated[field.key]  != null ? updated[field.key]  : "");
      if (oldVal === newVal) return;

      var oldDisplay = field.format ? field.format(oldVal) : (field.truncate ? truncate(oldVal) : (oldVal || "—"));
      var newDisplay = field.format ? field.format(newVal) : (field.truncate ? truncate(newVal) : (newVal || "—"));
      diffs.push(field.label + ": " + oldDisplay + " → " + newDisplay);
    });

    // Checklist: count changes
    var oldCl = original.checklist || {};
    var newCl = updated.checklist  || {};
    var clChanged = 0;
    Object.keys(newCl).forEach(function (k) {
      if (!!oldCl[k] !== !!newCl[k]) clChanged++;
    });
    if (clChanged > 0) {
      diffs.push("Checklist: " + clChanged + " item" + (clChanged === 1 ? "" : "s") + " changed");
    }

    return diffs;
  }

  function currency(value) {
    var n = Number(value || 0);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  }

  function truncate(value) {
    var s = String(value || "");
    return s.length > 40 ? s.slice(0, 40) + "…" : (s || "—");
  }

  function formatTs(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit"
      });
    } catch { return iso; }
  }

  /**
   * Render an HTML section displaying the action history timeline.
   * @param {object[]} history - bid.actionHistory array
   * @returns {string} HTML string
   */
  function renderHistory(history) {
    var entries = Array.isArray(history) ? history : [];

    var rows = entries.length
      ? entries.map(function (entry, idx) {
          var icon    = ACTION_ICONS[entry.type]  || "•";
          var label   = entry.label || ACTION_LABELS[entry.type] || entry.type || "Update";
          var ts      = formatTs(entry.ts);
          var changes = Array.isArray(entry.changes) && entry.changes.length
            ? '<ul style="margin:6px 0 0;padding-left:16px;color:#94a3b8;font-size:13px;line-height:1.8">' +
              entry.changes.map(function (c) { return '<li>' + escHtml(c) + '</li>'; }).join("") +
              '</ul>'
            : '';
          var isLast = idx === entries.length - 1;
          return (
            '<div style="display:flex;gap:14px;' + (isLast ? '' : 'padding-bottom:20px;') + '">' +
            '<div style="display:flex;flex-direction:column;align-items:center">' +
            '<div style="width:32px;height:32px;border-radius:50%;background:#1e293b;border:2px solid #334155;display:grid;place-items:center;font-size:14px;flex-shrink:0">' + icon + '</div>' +
            (isLast ? '' : '<div style="flex:1;width:2px;background:#1e293b;margin:4px 0"></div>') +
            '</div>' +
            '<div style="padding-top:4px;flex:1">' +
            '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
            '<span style="font-weight:600;color:#f1f5f9">' + escHtml(label) + '</span>' +
            '<span style="font-size:12px;color:#64748b">' + ts + '</span>' +
            '</div>' +
            changes +
            '</div></div>'
          );
        }).join("")
      : '<p style="color:#64748b;font-size:14px;margin:0">No action history recorded yet. History is captured on each edit save.</p>';

    return (
      '<section class="fca-panel">' +
      '<div class="fca-panel-header"><h3>⚡ Action History</h3>' +
      '<span style="font-size:12px;color:#64748b">' + entries.length + ' event' + (entries.length === 1 ? '' : 's') + '</span>' +
      '</div>' +
      '<div style="padding:4px 0">' + rows + '</div>' +
      '</section>'
    );
  }

  function escHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  global.FCA_BID_HISTORY = {
    buildEntry:     buildEntry,
    prependEntry:   prependEntry,
    detectChanges:  detectChanges,
    renderHistory:  renderHistory,
  };
})(window);
