import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchFinancialWorkspace,
  mutateFinancialWorkspace,
  createPayAppFromSov,
  advancePayApp,
  recordNativePayment,
  importBankCsv,
  createRecurringInvoice,
  runRecurringInvoice,
  generatePayAppDocument,
  postJournalEntry,
  upsertSovLine,
  fetchReportExport,
} from "../api/financialClient";

export default function useFinancialWorkspace(initialView = "dashboard", initialProjectId = "") {
  const [view, setView] = useState(initialView);
  const [report, setReport] = useState("profit_loss");
  const [projectId, setProjectId] = useState(initialProjectId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ backingSource: "loading" });

  const refresh = useCallback(async (nextView = view, nextReport = report, nextProjectId = projectId) => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchFinancialWorkspace(nextView, { report: nextReport, projectId: nextProjectId });
      setData(payload);
      setMeta({ backingSource: payload.backingSource || "auricrux-central-financial-accounting", lastSyncedAt: new Date().toISOString() });
      return payload;
    } catch (refreshError) {
      setError(refreshError.message || "Unable to load financial workspace.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [view, report, projectId]);

  useEffect(() => {
    refresh(view, report, projectId);
  }, [view, report, projectId, refresh]);

  return useMemo(
    () => ({
      view,
      report,
      projectId,
      data,
      loading,
      error,
      meta,
      setView,
      setReport,
      setProjectId,
      refresh,
      async createExpense(body) {
        const result = await mutateFinancialWorkspace("create-expense", body);
        await refresh("expenses", report);
        return result;
      },
      async createBill(body) {
        const result = await mutateFinancialWorkspace("create-bill", body);
        await refresh("bills", report);
        return result;
      },
      async payBill(billId) {
        const result = await mutateFinancialWorkspace("pay-bill", { billId });
        await refresh("bills", report);
        return result;
      },
      async reconcileTransaction(transactionId) {
        const result = await mutateFinancialWorkspace("reconcile-transaction", { transactionId });
        await refresh("banking", report, projectId);
        return result;
      },
      async createPayAppFromSov(targetProjectId = projectId) {
        const result = await createPayAppFromSov(targetProjectId);
        await refresh("construction", report, targetProjectId);
        return result;
      },
      async advancePayApp(payAppId, status) {
        const result = await advancePayApp(payAppId, status);
        await refresh("construction", report, projectId);
        return result;
      },
      async recordNativePayment(body) {
        const result = await recordNativePayment(body);
        await refresh("payments", report, projectId);
        return result;
      },
      async importBankCsv(body) {
        const result = await importBankCsv(body);
        await refresh("banking", report, projectId);
        return result;
      },
      async createRecurringInvoice(body) {
        const result = await createRecurringInvoice(body);
        await refresh("recurring", report, projectId);
        return result;
      },
      async runRecurringInvoice(recurringId) {
        const result = await runRecurringInvoice(recurringId);
        await refresh("recurring", report, projectId);
        return result;
      },
      async generatePayAppDocument(pid, payAppId) {
        return generatePayAppDocument(pid || projectId, payAppId);
      },
      async upsertSovLine(body) {
        const result = await upsertSovLine(body.projectId || projectId, body);
        await refresh("construction", report, body.projectId || projectId);
        return result;
      },
      async exportReport(reportType) {
        return fetchReportExport(reportType || report);
      },
      async postJournalEntry(body) {
        const result = await postJournalEntry(body);
        await refresh("journal", report, projectId);
        return result;
      },
    }),
    [view, report, projectId, data, loading, error, meta, refresh],
  );
}
