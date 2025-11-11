// SignBol.jsx
import React, { useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import { Toast } from "primereact/toast";

const USE_MOCK = false;

/* ---------------- Mock (optional) ---------------- */
const MOCK_DB = {
  "TRK-000017016": {
    TruckId: "TRK-000017016",
    DownloadsLinks: [
      { SalesOrderNumber: "SO-00028607", Link: "https://example.com/bol1.pdf" },
    ],
    Id: 10016,
  },
};
const mockStatusResponse = (truckId) =>
  MOCK_DB[truckId] ?? { TruckId: truckId, DownloadsLinks: [], Id: null };

/* ---------------- Endpoints ---------------- */
const BOL_SEARCH_ENDPOINT =
  "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/appointment/bol";
const SIGN_BOL_ENDPOINT =
  "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/processbol";

/* ---------------- Helpers ---------------- */
function parseSearchTerms(raw = "") {
  const parts = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let truckId = "";
  let appointmentId = "";
  const salesOrderIds = [];

  for (const p of parts) {
    if (/^TRK-\w+/i.test(p)) truckId = p.toUpperCase();
    else if (/^APPT?-\w+/i.test(p)) appointmentId = p.toUpperCase();
    else if (/^SO-\d+/i.test(p)) salesOrderIds.push(p.toUpperCase());
  }

  // If only 1 token with no prefix, treat it as Truck ID
  if (!truckId && !appointmentId && salesOrderIds.length === 0 && parts.length === 1) {
    truckId = parts[0].toUpperCase();
  }

  return { truckId, appointmentId, salesOrderIds };
}

function normalizeDocs(data) {
  if (!data) return [];

  // Newest shape:
  // { message, viewBolResponses: { id, viewBolResponses: [{ salesOrderNumber, blobUrlLink }] } }
  const nested = data?.viewBolResponses?.viewBolResponses;
  if (Array.isArray(nested)) {
    return nested
      .map((x, i) => ({
        so: x?.salesOrderNumber || `SO-${i + 1}`,
        url: x?.blobUrlLink || "",
      }))
      .filter((d) => !!d.url);
  }

  // Alternate shape:
  if (Array.isArray(data?.downloadLinks)) {
    return data.downloadLinks
      .map((x, i) => ({
        so: x?.salesOrderNumber || `SO-${i + 1}`,
        url: x?.blobUrlLink || "",
      }))
      .filter((d) => !!d.url);
  }

  // Legacy shape:
  if (Array.isArray(data?.DownloadsLinks)) {
    return data.DownloadsLinks
      .map((x, i) => ({
        so: x?.SalesOrderNumber || `SO-${i + 1}`,
        url: x?.Link || "",
      }))
      .filter((d) => !!d.url);
  }

  return [];
}

/* ---------------- Component ---------------- */
export default function SignBol() {
  const toast = useRef(null);
  const sigCanvas = useRef();

  // Search inputs (each field has its own state)
  const [truckInput, setTruckInput] = useState("");
  const [soInput, setSoInput] = useState("");
  const [apptInput, setApptInput] = useState("");

  // Data/results
  const [docs, setDocs] = useState([]); // [{so,url}]
  const [truckId, setTruckId] = useState("");
  const [driverCheckinId, setDriverCheckinId] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docDialogVisible, setDocDialogVisible] = useState(false);
  const [signedBols, setSignedBols] = useState([]); // [{so,url}]
  const [signedBolDialogVisible, setSignedBolDialogVisible] = useState(false);
  const [disablePrint, setDisablePrint] = useState(true);

  const HAS_DOCS = docs.length > 0;

  // Compose fields → raw tokens (space separated) and search
  const runSearch = () => {
    const raw = [truckInput.trim(), soInput.trim(), apptInput.trim()]
      .filter(Boolean)
      .join(" ");
    handleSearch(raw);
  };

  const handleSearch = async (rawInput = "") => {
    const raw = rawInput.trim();
    if (!raw) {
      toast.current.show({
        severity: "warn",
        summary: "ID required",
        detail: "Enter Truck ID, Sales Order, or Appointment ID.",
        life: 2500,
      });
      return;
    }

    setLoading(true);
    setDocs([]);
    setSignedBols([]);
    setDisablePrint(true);
    setSelectedDoc(null);

    try {
      let data;
      if (USE_MOCK) {
        const guess = parseSearchTerms(raw).truckId || raw;
        data = mockStatusResponse(guess);
      } else {
        const { truckId: tid, appointmentId: aid, salesOrderIds } = parseSearchTerms(raw);
        const url = new URL(BOL_SEARCH_ENDPOINT);
        if (tid) url.searchParams.set("truckId", tid);
        if (aid) url.searchParams.set("appointmentId", aid);
        for (const so of salesOrderIds) url.searchParams.append("salesOrderIds", so);

        const res = await axios.get(url.toString(), { headers: { accept: "application/json" } });
        data = res?.data;
      }

      // Server identifiers
      const parsedTruck = parseSearchTerms(raw).truckId;
      setTruckId(data?.TruckId || parsedTruck || raw);
      const cid = data?.viewBolResponses?.id ?? data?.Id ?? data?.id ?? null;
      setDriverCheckinId(cid);

      const normalized = normalizeDocs(data);
      setDocs(normalized);

      if (normalized.length === 0) {
        toast.current.show({
          severity: "info",
          summary: "No BOLs",
          detail: "No Bill of Lading documents matched your input.",
          life: 3000,
        });
        return;
      }

      toast.current.show({
        severity: "success",
        summary: "Loaded",
        detail: `Found ${normalized.length} document(s).`,
        life: 2500,
      });
    } catch (er) {
      console.error("Error fetching data:", er);
      const msg = er?.response?.data?.message || er?.message || "Unable to fetch documents.";
      toast.current.show({ severity: "error", summary: "Fetch failed", detail: msg, life: 3500 });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSignature = () => sigCanvas.current?.clear();

  const handleSubmit = async () => {
    // Guard: signature present
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.current.show({
        severity: "info",
        summary: "Signature Required",
        detail: "Please sign inside the box before submitting.",
        life: 3000,
      });
      return;
    }

    // Gather PDF links from search results
    const links = (docs || [])
      .map((d) => (d?.url || "").trim().replace(/^"|"$/g, ""))
      .filter(Boolean);

    if (links.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "No BOLs",
        detail: "Load BOL documents before signing.",
        life: 3000,
      });
      return;
    }

    // Server-side Id (from search response)
    if (driverCheckinId == null) {
      toast.current.show({
        severity: "warn",
        summary: "Missing Id",
        detail: "Couldn’t find the required Id from the search response.",
        life: 3000,
      });
      return;
    }

    const toErrorMessage = (err) => {
      const pd = err?.response?.data;
      if (!pd) return err?.message || "Bad Request";
      if (typeof pd === "string") return pd;
      const parts = [];
      if (pd.title) parts.push(pd.title);
      if (pd.detail) parts.push(pd.detail);
      if (pd.errors) {
        const all = Object.values(pd.errors).flat().join(" | ");
        if (all) parts.push(all);
      }
      return parts.join(" — ") || "Bad Request";
    };

    try {
      // Signature → File
      const dataUrl = sigCanvas.current.toDataURL("image/png");
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const file = new File([blob], "signature.png", { type: "image/png" });

      // Contract: Id, pngSing, metaJson (string with BlobLinks)
      const form = new FormData();
      form.append("Id", String(driverCheckinId)); // exact key
      form.append("pngSing", file, file.name); // exact key
      form.append("metaJson", JSON.stringify({ BlobLinks: links }));

      // Debug
      console.group("FormData preview");
      for (const [k, v] of form.entries()) {
        console.log(k, v instanceof File ? { name: v.name, type: v.type, size: v.size } : v);
      }
      console.groupEnd();

      const response = await axios.post(SIGN_BOL_ENDPOINT, form, {
        headers: { Accept: "text/plain, application/json" }, // let browser set boundary
      });

      // Server may return JSON { blobPdfLink } or text/plain (URL)
      let combinedUrl =
        response?.data?.blobPdfLink ||
        response?.data?.BlobPdfLink ||
        (typeof response?.data === "string" ? response.data : "");

      if (!combinedUrl && typeof response?.data === "string") {
        try {
          const parsed = JSON.parse(response.data);
          combinedUrl = parsed?.blobPdfLink || parsed?.BlobPdfLink || "";
        } catch {}
      }
      if (!combinedUrl && typeof response?.data === "string" && /^https?:\/\//i.test(response.data)) {
        combinedUrl = response.data;
      }

      if (combinedUrl) {
        setSignedBols([{ so: "Combined", url: combinedUrl }]);
        setDisablePrint(false);
        sigCanvas.current.clear();

        toast.current.show({
          severity: "success",
          summary: "Signed",
          detail: "Combined signed BOL generated.",
          life: 4000,
        });

        setSignedBolDialogVisible(true);
      } else {
        toast.current.show({
          severity: "warn",
          summary: "No PDF Returned",
          detail: response?.data?.message || "Server did not return a signed PDF link.",
          life: 4000,
        });
      }
    } catch (error) {
      console.error("❌ Error submitting signature:", error);
      toast.current.show({
        severity: "error",
        summary: "Submission Failed",
        detail: toErrorMessage(error),
        life: 5000,
      });
    }
  };

  const openPreview = (doc) => {
    if (!doc?.url) {
      toast.current.show({
        severity: "warn",
        summary: "Missing URL",
        detail: "This item has no URL to preview.",
        life: 2000,
      });
      return;
    }
    setSelectedDoc(doc);
    setDocDialogVisible(true);
  };

  const handleViewSigned = () => {
    if (!signedBols.length) {
      toast.current.show({
        severity: "warn",
        summary: "No Signed BOLs",
        detail: "Please submit signature first.",
        life: 3000,
      });
      return;
    }
    setSignedBolDialogVisible(true);
  };

  const handlePrintSigned = () => {
    if (!signedBols.length) {
      toast.current.show({
        severity: "warn",
        summary: "No Signed BOLs",
        detail: "Please submit signature first.",
        life: 3000,
      });
      return;
    }
    signedBols.forEach((d) =>
      window.open(d.url, "_blank", "noopener,noreferrer")
    );
  };

  return (
    <div className="sb-root">
      {/* Inline theme for portability */}
      <style>{`
        :root{
          --primary:#0a4323;
          --primary-ink:#ffffff;
          --panel:#eaf6de;
          --card:#ffffff;
          --ink:#151515;
          --muted:#5f6a5f;
          --border:#cfd7c9;
          --radius:14px;
          --shadow:0 10px 24px rgba(0,0,0,.10);
          --shadow-sm:0 6px 16px rgba(0,0,0,.08);
        }
        .sb-root{
          min-height:100dvh;
          background: var(--panel);
          padding: clamp(16px, 2.5vw, 28px);
          color: var(--ink);
        }
        // .sb-shell{
        //   max-width: 1220px;
        //   margin: 0 auto;
        //   background: var(--card);
        //   border: 1px solid var(--border);
        //   border-radius: 18px;
        //   box-shadow: var(--shadow);
        //   padding: clamp(18px, 2.4vw, 28px);
        // }
           .sb-shell{
   /* Scale up on big monitors */
  max-width: clamp(1500px, 100vw, 2000px);
   margin: 0 auto;
   background: var(--card);
   border: 1px solid var(--border);
   border-radius: 18px;
   box-shadow: var(--shadow);
   padding: clamp(18px, 2vw, 28px);
   min-height: clamp(720px, 90dvh, 1200px);
  display: flex;
  flex-direction: column;
 }
        .sb-title{
          font-weight: 900;
          letter-spacing:.2px;
          margin: 0 0 14px 0;
          font-size: clamp(20px, 2.2vw, 26px);
        }
        .sb-section{ margin-top: clamp(12px, 1.8vw, 18px); }

        /* Search grid */
        .sb-grid{
          display:grid; gap: 16px;
          grid-template-columns: 1fr 1fr;
        }
        .sb-col-span-2 { grid-column: span 2; }
        @media (max-width: 980px){ .sb-grid{ grid-template-columns: 1fr; } }

        .sb-field label{
          display:block; font-weight:800; margin:0 0 8px 4px;
        }
        .p-inputtext{
          width:100%;
          border-radius: var(--radius);
          border-color: var(--border);
          background:#fff;
        }
        .p-inputtext:focus{
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(10,67,35,.18);
        }

        /* OR divider */
        .sb-or .p-divider-content{
          padding: 0 8px;
        }
        .sb-tag{
          display:inline-block;
          font-size:.75rem;
          background:#e8f2ea;
          color:#3a4a3a;
          border-radius:999px;
          padding:3px 10px;
          font-weight:800;
        }

        /* Buttons */
        .sb-btn-primary,
        .p-button.p-button-success{
          background: var(--primary) !important;
          border-color: var(--primary) !important;
          color: var(--primary-ink) !important;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }
        .sb-btn-secondary{
          background:#fff !important;
          color: var(--ink) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }
        .p-button:disabled{ opacity:.55 !important; }

        /* Document cards */
        .sb-docs{
          display:grid; gap:16px;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        }
        .sb-card{
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          padding: 12px;
          display:grid; gap:10px;
        }
        .sb-card h5{ margin:0; font-size: 15px; font-weight: 800; }

        /* Signature panel */
        .sb-sign{
          background:#fff; border:1px solid var(--border); border-radius: var(--radius);
          padding: 12px;
        }
        .sb-actions{
          display:grid; gap: 12px;
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 980px){ .sb-actions{ grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px){ .sb-actions{ grid-template-columns: 1fr; } }

        /* Status line */
        .sb-status{
          font-weight:800; margin: 2px 0 12px;
        }
        .sb-status .ok{ color: #1f6c2a; }
        .sb-status .bad{ color: #9b1c1c; }
      `}</style>

      <div className="sb-shell">
        <h2 className="sb-title">Sign BOL</h2>

        {/* Search */}
        <section className="sb-section">
          <div className="sb-grid">
            {/* Truck */}
            <div className="sb-field">
              <label htmlFor="truckId">Truck ID</label>
              <InputText
                id="truckId"
                value={truckInput}
                onChange={(e) => setTruckInput(e.target.value)}
                placeholder="e.g., TRK-000017011"
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>

            <div className="sb-or">
              <Divider type="dashed" align="center">
                <span className="sb-tag">OR</span>
              </Divider>
            </div>

            {/* Sales Order */}
            <div className="sb-field">
              <label htmlFor="soId">Sales Order ID</label>
              <InputText
                id="soId"
                value={soInput}
                onChange={(e) => setSoInput(e.target.value)}
                placeholder="e.g., SO-00027585"
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
              <small style={{ color: "var(--muted)" }}>
                You can also enter multiple SOs separated by spaces/commas.
              </small>
            </div>

            <div className="sb-or">
              <Divider type="dashed" align="center">
                <span className="sb-tag">OR</span>
              </Divider>
            </div>

            {/* Appointment */}
            <div className="sb-field">
              <label htmlFor="apptId">Appointment ID</label>
              <InputText
                id="apptId"
                value={apptInput}
                onChange={(e) => setApptInput(e.target.value)}
                placeholder="e.g., APPT-981011"
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>

            {/* Search button (right/second column on desktop) */}
            <div className="sb-field">
              <label style={{ visibility: "hidden" }}>Search</label>
              <Button
                label={loading ? "Searching…" : "Search"}
                icon="pi pi-search"
                className="w-full sb-btn-primary"
                onClick={runSearch}
                disabled={loading}
                aria-label="Search documents by Truck ID, Sales Order ID, or Appointment ID"
              />
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="sb-section">
          <h4 style={{ margin: "0 0 10px" }}>
            Documents:{" "}
            <span style={{ color: HAS_DOCS ? "#1f6c2a" : "#9b1c1c" }}>
              {HAS_DOCS ? `${docs.length} found` : "None"}
            </span>
          </h4>

          {HAS_DOCS && (
            <div className="sb-docs">
              {docs.map((d, i) => (
                <div className="sb-card" key={`${d.so}-${i}`}>
                  <h5>SO: {d.so}</h5>
                  <Button
                    label="View BOL"
                    icon="pi pi-eye"
                    className="sb-btn-secondary w-full"
                    onClick={() => openPreview(d)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="sb-status">
            Document View Status:{" "}
            <span className={HAS_DOCS ? "ok" : "bad"}>
              {HAS_DOCS ? "Document Viewed" : "Not Viewed"}
            </span>
          </div>
        </section>

        {/* Signature */}
        <section className="sb-section">
          <h4 style={{ margin: "0 0 10px" }}>Sign Below</h4>
          <div className="sb-sign">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 1100,
                height: 280,
                className: "sigCanvas",
                style: { width: "100%", height: 220, background: "#f7f7f7", borderRadius: 10 },
              }}
            />
          </div>

          <div className="sb-section sb-actions">
            <Button
              label="Clear"
              icon="pi pi-times"
              className="sb-btn-secondary w-full"
              onClick={handleClearSignature}
            />
            <Button
              label="Submit"
              icon="pi pi-check"
              className="sb-btn-primary w-full"
              onClick={handleSubmit}
              disabled={!HAS_DOCS}
            />
            <Button
              label="View Signed BOL(s)"
              icon="pi pi-eye"
              className="sb-btn-secondary w-full"
              onClick={handleViewSigned}
              disabled={!signedBols.length}
            />
            <Button
              label="Print Signed BOL(s)"
              icon="pi pi-print"
              className="sb-btn-primary w-full"
              onClick={handlePrintSigned}
              disabled={!signedBols.length || disablePrint}
            />
          </div>
        </section>

        {/* Preview dialogs */}
        <Dialog
          header={selectedDoc?.so ? `Document — ${selectedDoc.so}` : "Document Preview"}
          visible={docDialogVisible}
          onHide={() => setDocDialogVisible(false)}
          style={{ width: "72vw", height: "80vh", maxWidth: 1100 }}
          breakpoints={{ "1024px": "90vw", "641px": "98vw" }}
          maximizable
        >
          {selectedDoc?.url ? (
            <iframe
              src={selectedDoc.url}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="Document Preview"
            />
          ) : (
            <p style={{ textAlign: "center" }}>No document selected</p>
          )}
        </Dialog>

        <Dialog
          header="Signed BOLs"
          visible={signedBolDialogVisible}
          onHide={() => setSignedBolDialogVisible(false)}
          style={{ width: "72vw", height: "80vh", maxWidth: 1100 }}
          breakpoints={{ "1024px": "90vw", "641px": "98vw" }}
          maximizable
        >
          {signedBols.length ? (
            <div style={{ display: "grid", gap: 12, height: "100%", overflow: "auto" }}>
              {signedBols.map((doc, i) => (
                <div key={`signed-${i}`} style={{ height: "80vh" }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    {doc.so ? `Signed BOL — ${doc.so}` : `Signed BOL ${i + 1}`}
                  </div>
                  <iframe
                    src={doc.url}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title={`Signed BOL ${doc.so || i + 1}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center" }}>No signed documents available</p>
          )}
        </Dialog>
      </div>

      <Toast ref={toast} />
    </div>
  );
}
