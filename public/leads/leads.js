(function (global) {
  var cfg = global.FCA_AURICRUX || {};
  const CENTRAL_API =
    cfg.CENTRAL_API ||
    global.FCA_CENTRAL_API ||
    "https://auricrux-central.azurewebsites.net/api";

  const PILOT_CHECKOUT_BASE =
    cfg.PILOT_PAYMENT_LINK ||
    global.FCA_PILOT_PAYMENT_LINK ||
    "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

  const PIPELINE_STAGES = [
    "new",
    "under-review",
    "qualified",
    "invited",
    "proposal",
    "negotiation",
    "won",
    "lost"
  ];

  const STAGE_LABELS = {
    new: "New",
    "under-review": "Under Review",
    qualified: "Qualified",
    invited: "Invited",
    proposal: "Proposal",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost"
  };

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function formatDate(value) {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }

  function scoreClass(score) {
    const n = Number(score || 0);
    if (n >= 75) return "fca-score-high";
    if (n >= 50) return "fca-score-mid";
    return "fca-score-low";
  }

  function stageBadgeClass(stage) {
    const key = String(stage || "new").replace(/\s+/g, "-").toLowerCase();
    if (key === "under-review") return "fca-badge fca-badge-qualified";
    return "fca-badge fca-badge-" + key;
  }

  function checkoutUrl(intakeId) {
    if (cfg.pilotCheckoutUrl) return cfg.pilotCheckoutUrl(intakeId);
    return (
      PILOT_CHECKOUT_BASE +
      "?client_reference_id=" +
      encodeURIComponent(intakeId)
    );
  }

  function normalizeLead(item) {
    if (!item) return null;
    const client = item.client || {};
    const site = item.site || {};
    const auricrux = item.auricruxSummary || item.auricrux || {};

    return {
      id: item.leadId,
      leadId: item.leadId,
      intakeId: item.leadId,
      company: client.name || client.company || "Unknown",
      projectName: site.name || site.projectName || "Unnamed project",
      contactName: client.contactName || "",
      contactEmail: client.contactEmail || "",
      contactPhone: client.contactPhone || "",
      trade: item.serviceLine || site.trade || "",
      location: site.jurisdiction || site.location || "",
      value: Number(site.estimatedValue || site.value || 0),
      notes: item.notes || "",
      leadType: client.leadType || "",
      projectType: site.projectType || "",
      bidDeadline: site.bidDeadline || "",
      squareFootage: site.squareFootage || "",
      unionRequired: site.unionRequired || "",
      source: item.sourceChannel || "lead-gen",
      pipelineStage: item.status || "new",
      status: item.status || "new",
      budgetStatus: item.budgetStatus || "",
      jurisdictionStatus: item.jurisdictionStatus || "",
      ownershipStatus: item.ownershipStatus || "",
      opportunityId: item.opportunityId || "",
      createdAt: item.createdAt || "",
      updatedAt: item.updatedAt || "",
      auricruxScore: Number(auricrux.score || item.auricruxScore || estimateScore(item)),
      auricruxRisk: auricrux.risk || item.auricruxRisk || estimateRisk(item),
      auricruxRecommendation:
        auricrux.nextAction ||
        item.nextAction ||
        defaultNextAction(item.status || "new"),
      auricruxNarrative: auricrux.summary || item.qualificationNotes || "",
      nextAction:
        auricrux.nextAction ||
        item.nextAction ||
        defaultNextAction(item.status || "new"),
      raw: item
    };
  }

  function estimateScore(item) {
    let score = 45;
    const client = item.client || {};
    const site = item.site || {};
    if (client.contactEmail) score += 10;
    if (client.contactPhone) score += 8;
    if (site.jurisdiction) score += 8;
    if (item.budgetStatus === "confirmed") score += 12;
    if (item.ownershipStatus === "verified") score += 10;
    if (Number(site.estimatedValue || 0) >= 100000) score += 7;
    return Math.min(score, 100);
  }

  function estimateRisk(item) {
    const score = estimateScore(item);
    if (score >= 75) return "low";
    if (score >= 55) return "medium";
    return "high";
  }

  function defaultNextAction(status) {
    const map = {
      new: "Run Auricrux intake qualification review",
      "under-review": "Complete qualification checklist",
      qualified: "Issue pilot invite and begin estimate handoff",
      invited: "Complete pilot checkout",
      proposal: "Prepare proposal-ready package",
      negotiation: "Advance commercial terms review",
      won: "Activate onboarding and project workspace",
      lost: "Archive lead and capture loss reason"
    };
    return map[status] || "Review lead in Auricrux Central";
  }

  async function request(path, options) {
    if (cfg.centralFetch) {
      return cfg.centralFetch(path, options);
    }
    const response = await fetch(CENTRAL_API + path, {
      cache: "no-store",
      ...(options || {})
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(text || "Invalid response from Auricrux Central");
    }
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || text || "Request failed (" + response.status + ")");
    }
    return data;
  }

  async function fetchLeads() {
    const data = await request("/leads");
    return (data.items || []).map(normalizeLead);
  }

  async function fetchLeadById(id) {
    const data = await request("/leads/" + encodeURIComponent(id));
    return normalizeLead(data.item);
  }

  async function fetchCommercialPipeline() {
    const data = await request("/commercial-pipeline");
    return data.items || [];
  }

  function buildLeadPayload(form) {
    const company = String(form.company || "").trim();
    const projectName = String(form.projectName || "").trim();

    return {
      sourceChannel: form.source || "lead-gen",
      serviceLine: form.trade || "general-construction",
      projectIntent: form.projectType || "commercial",
      budgetSignal: form.budgetConfirmed ? "confirmed" : "pending",
      sourceRoute: form.sourceRoute || "/leads/new.html",
      createdBy: "fca-lead-intelligence",
      client: {
        name: company,
        contactName: form.contactName || "",
        contactEmail: form.contactEmail || "",
        contactPhone: form.contactPhone || "",
        leadType: form.leadType || "gc"
      },
      site: {
        name: projectName,
        jurisdiction: form.location || "",
        projectType: form.projectType || "",
        estimatedValue: Number(form.value || 0),
        squareFootage: form.squareFootage || "",
        bidDeadline: form.bidDeadline || "",
        unionRequired: form.unionRequired || "",
        trade: form.trade || ""
      },
      notes: form.notes || "",
      checklist: {
        plansReceived: !!form.plansReceived,
        siteWalkComplete: !!form.siteWalkComplete,
        budgetConfirmed: !!form.budgetConfirmed,
        decisionMakerIdentified: !!form.decisionMakerIdentified
      }
    };
  }

  async function saveLead(form) {
    const payload = buildLeadPayload(form);
    const data = await request("/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return normalizeLead(data.item);
  }

  async function updateLead(leadId, updates) {
    const data = await request("/leads/" + encodeURIComponent(leadId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updates,
        updatedBy: "fca-lead-intelligence",
        sourceRoute: updates.sourceRoute || "/leads/detail.html"
      })
    });
    return normalizeLead(data.item);
  }

  async function qualifyLead(leadId, reason) {
    const data = await request("/leads/" + encodeURIComponent(leadId) + "/qualify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: reason || "Qualified through FCA Lead Intelligence review.",
        qualifiedBy: "auricrux",
        sourceRoute: "/leads/detail.html"
      })
    });
    return {
      lead: normalizeLead(data.lead),
      opportunity: data.opportunity || null
    };
  }

  function computeMetrics(leads) {
    const active = leads.filter(function (l) {
      return l.pipelineStage !== "lost";
    });
    const pipelineValue = active.reduce(function (sum, l) {
      return sum + Number(l.value || 0);
    }, 0);
    const wonValue = leads
      .filter(function (l) {
        return l.pipelineStage === "won";
      })
      .reduce(function (sum, l) {
        return sum + Number(l.value || 0);
      }, 0);
    const avgScore =
      leads.length === 0
        ? 0
        : Math.round(
            leads.reduce(function (sum, l) {
              return sum + Number(l.auricruxScore || 0);
            }, 0) / leads.length
          );

    return {
      totalLeads: leads.length,
      activeLeads: active.length,
      pipelineValue: pipelineValue,
      wonValue: wonValue,
      avgScore: avgScore
    };
  }

  function groupByStage(leads) {
    const grouped = {};
    PIPELINE_STAGES.forEach(function (stage) {
      grouped[stage] = [];
    });
    leads.forEach(function (lead) {
      const stage = lead.pipelineStage || "new";
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(lead);
    });
    return grouped;
  }

  function renderTopbar(active) {
    return (
      '<div class="fca-topbar">' +
      '<div class="fca-brand">' +
      '<div class="fca-brand-mark">A</div>' +
      "<div>" +
      "<h1>FCA Lead Intelligence</h1>" +
      "<p>Enterprise lead generation via Auricrux Central</p>" +
      "</div></div>" +
      '<div class="fca-nav">' +
      '<a class="fca-btn fca-btn-secondary' +
      (active === "pipeline" ? '" style="border-color:#2563eb"' : '"') +
      ' href="/leads/">Pipeline</a>' +
      '<a class="fca-btn fca-btn-secondary' +
      (active === "new" ? '" style="border-color:#2563eb"' : '"') +
      ' href="/leads/new.html">New Lead</a>' +
      '<a class="fca-btn fca-btn-secondary" href="/pipeline/">Auricrux Sync</a>' +
      '<a class="fca-btn fca-btn-primary" href="/leads/new.html">+ Capture Lead</a>' +
      "</div></div>"
    );
  }

  global.FCALeads = {
    CENTRAL_API: CENTRAL_API,
    PILOT_CHECKOUT_BASE: PILOT_CHECKOUT_BASE,
    PIPELINE_STAGES: PIPELINE_STAGES,
    STAGE_LABELS: STAGE_LABELS,
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    scoreClass: scoreClass,
    stageBadgeClass: stageBadgeClass,
    checkoutUrl: checkoutUrl,
    normalizeLead: normalizeLead,
    fetchLeads: fetchLeads,
    fetchLeadById: fetchLeadById,
    fetchCommercialPipeline: fetchCommercialPipeline,
    saveLead: saveLead,
    updateLead: updateLead,
    qualifyLead: qualifyLead,
    buildLeadPayload: buildLeadPayload,
    computeMetrics: computeMetrics,
    groupByStage: groupByStage,
    renderTopbar: renderTopbar
  };
})(window);
