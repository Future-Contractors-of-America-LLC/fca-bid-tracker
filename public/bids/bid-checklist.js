/**
 * Proposal-readiness checklist for FCA bid surfaces.
 * Stored in Auricrux Central bid.checklist JSON (POST upsert).
 */
(function (global) {
  var CORE_SCORE_KEYS = ["plansReceived", "siteWalkComplete"];

  var PROPOSAL_READINESS_ITEMS = [
    { key: "plansReceived", label: "Plans / drawings received", tier: "core", weight: 12 },
    { key: "siteWalkComplete", label: "Site walk completed", tier: "core", weight: 12 },
    { key: "budgetConfirmed", label: "Budget confirmed with owner", tier: "commercial", weight: 10 },
    { key: "decisionMakerIdentified", label: "Decision maker identified", tier: "commercial", weight: 10 },
    { key: "scopeDocumented", label: "Scope documented and aligned", tier: "technical", weight: 10 },
    { key: "scheduleConfirmed", label: "Schedule / bid deadline confirmed", tier: "commercial", weight: 8 },
    { key: "insuranceVerified", label: "Insurance requirements verified", tier: "risk", weight: 8 },
    { key: "bondingResolved", label: "Bonding requirements resolved", tier: "risk", weight: 8 },
    { key: "subQuotesReceived", label: "Subcontractor quotes received", tier: "technical", weight: 10 },
    { key: "proposalTemplateReady", label: "Proposal template selected", tier: "delivery", weight: 6 },
    { key: "pricingReviewComplete", label: "Internal pricing review complete", tier: "delivery", weight: 6 },
  ];

  function normalizeChecklist(checklist) {
    return checklist && typeof checklist === "object" ? checklist : {};
  }

  function computeReadiness(checklist) {
    var items = PROPOSAL_READINESS_ITEMS;
    var cl = normalizeChecklist(checklist);
    var totalWeight = 0;
    var earnedWeight = 0;
    var completed = 0;
    var missing = [];

    items.forEach(function (item) {
      totalWeight += item.weight;
      if (cl[item.key] === true) {
        earnedWeight += item.weight;
        completed += 1;
      } else {
        missing.push(item);
      }
    });

    var percent = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    var status = "not-ready";
    if (percent >= 85) status = "proposal-ready";
    else if (percent >= 60) status = "nearly-ready";
    else if (percent >= 35) status = "in-progress";

    return {
      percent: percent,
      status: status,
      completed: completed,
      total: items.length,
      missing: missing,
      coreComplete: CORE_SCORE_KEYS.every(function (key) { return cl[key] === true; }),
    };
  }

  function statusLabel(status) {
    var map = {
      "proposal-ready": "Proposal ready",
      "nearly-ready": "Nearly ready",
      "in-progress": "In progress",
      "not-ready": "Not ready",
    };
    return map[status] || status;
  }

  function statusBadgeClass(status) {
    if (status === "proposal-ready") return "fca-badge fca-badge-qualified";
    if (status === "nearly-ready") return "fca-badge fca-badge-under-review";
    if (status === "in-progress") return "fca-badge fca-badge-new";
    return "fca-badge fca-badge-lost";
  }

  function renderChecklistEditor(checklist) {
    var cl = normalizeChecklist(checklist);
    var tiers = ["core", "commercial", "technical", "risk", "delivery"];
    var tierLabels = {
      core: "Core intake",
      commercial: "Commercial qualification",
      technical: "Technical scope",
      risk: "Risk & compliance",
      delivery: "Proposal delivery",
    };

    return tiers.map(function (tier) {
      var tierItems = PROPOSAL_READINESS_ITEMS.filter(function (i) { return i.tier === tier; });
      if (!tierItems.length) return "";
      return (
        '<div class="fca-full"><div class="fca-metric-label" style="margin-bottom:8px">' + tierLabels[tier] + '</div>' +
        '<div class="fca-grid-2">' +
        tierItems.map(function (item) {
          return (
            '<div><label class="fca-label" style="display:flex;align-items:flex-start;gap:8px;font-weight:500">' +
            '<input type="checkbox" id="chk_' + item.key + '"' + (cl[item.key] ? " checked" : "") + ' style="margin-top:4px" />' +
            '<span>' + item.label + '</span></label></div>'
          );
        }).join("") +
        '</div></div>'
      );
    }).join("");
  }

  function readChecklistFromForm() {
    var checklist = {};
    PROPOSAL_READINESS_ITEMS.forEach(function (item) {
      var el = document.getElementById("chk_" + item.key);
      checklist[item.key] = !!(el && el.checked);
    });
    return checklist;
  }

  function renderReadinessSummary(checklist) {
    var readiness = computeReadiness(checklist);
    var missingHtml = readiness.missing.length
      ? '<ul style="margin:12px 0 0;padding-left:18px;color:#cbd5e1;line-height:1.7">' +
        readiness.missing.slice(0, 5).map(function (item) {
          return "<li>" + item.label + "</li>";
        }).join("") +
        (readiness.missing.length > 5 ? "<li>+" + (readiness.missing.length - 5) + " more items</li>" : "") +
        "</ul>"
      : '<p style="color:#86efac;margin:12px 0 0">All proposal-readiness items complete.</p>';

    return (
      '<section class="fca-panel">' +
      '<div class="fca-panel-header"><h3>Proposal Readiness</h3>' +
      '<span class="' + statusBadgeClass(readiness.status) + '">' + statusLabel(readiness.status) + '</span></div>' +
      '<div class="fca-metrics">' +
      '<div class="fca-metric"><div class="fca-metric-label">Readiness</div><div class="fca-metric-value">' + readiness.percent + '%</div></div>' +
      '<div class="fca-metric"><div class="fca-metric-label">Checklist</div><div class="fca-metric-value">' + readiness.completed + '/' + readiness.total + '</div></div>' +
      '<div class="fca-metric"><div class="fca-metric-label">Core intake</div><div class="fca-metric-value">' + (readiness.coreComplete ? "Complete" : "Open") + '</div></div>' +
      '</div>' +
      '<p style="color:#64748b;font-size:14px;margin:0">Complete checklist items on the edit page to raise Auricrux bid strength and unlock proposal-ready status.</p>' +
      missingHtml +
      '</section>'
    );
  }

  global.FCA_BID_CHECKLIST = {
    PROPOSAL_READINESS_ITEMS: PROPOSAL_READINESS_ITEMS,
    computeReadiness: computeReadiness,
    statusLabel: statusLabel,
    statusBadgeClass: statusBadgeClass,
    renderChecklistEditor: renderChecklistEditor,
    readChecklistFromForm: readChecklistFromForm,
    renderReadinessSummary: renderReadinessSummary,
  };
})(window);
