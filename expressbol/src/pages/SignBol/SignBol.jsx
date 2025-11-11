import React, { useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import { Toast } from "primereact/toast";

/** Toggle mock mode while API is not ready */
const USE_MOCK = false;

// -------- Mock DB (kept) --------
const MOCK_DB = {
  "TRK-000017011": {
    TruckId: "TRK-000017011",
    DownloadsLinks: [
      {
        SalesOrderNumber: "SO-00028606",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028606",
      },
      {
        SalesOrderNumber: "SO-00028608",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028608",
      },
      {
        SalesOrderNumber: "SO-00028616",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028616",
      },
    ],
    Id: 10011,
  },
  "TRK-000017012": {
    TruckId: "TRK-000017012",
    DownloadsLinks: [
      {
        SalesOrderNumber: "SO-00028603",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028603",
      },
      {
        SalesOrderNumber: "SO-00028604",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028604",
      },
      {
        SalesOrderNumber: "SO-00028613",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028613",
      },
    ],
    Id: 10012,
  },
  "TRK-000017013": {
    TruckId: "TRK-000017013",
    DownloadsLinks: [
      {
        SalesOrderNumber: "SO-00028609",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028609",
      },
      {
        SalesOrderNumber: "SO-00028612",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028612",
      },
      {
        SalesOrderNumber: "SO-00028614",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028614",
      },
      {
        SalesOrderNumber: "SO-00028615",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028615",
      },
    ],
    Id: 10013,
  },
  "TRK-000017014": {
    TruckId: "TRK-000017014",
    DownloadsLinks: [
      {
        SalesOrderNumber: "SO-00028605",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028605",
      },
    ],
    Id: 10014,
  },
  "TRK-000017015": {
    TruckId: "TRK-000017015",
    DownloadsLinks: [
      {
        SalesOrderNumber: "SO-00028611",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028611",
      },
    ],
    Id: 10015,
  },
  "TRK-000017016": {
    TruckId: "TRK-000017016",
    DownloadsLinks: [
      {
        SalesOrderNumber: "SO-00028607",
        Link:
          "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf?sp=r&st=2025-11-02T09:16:44Z&se=2026-11-02T17:31:44Z&spr=https&sv=2024-11-04&sr=c&so=SO-00028607",
      },
    ],
    Id: 10016,
  },
};
const mockStatusResponse = (truckId) =>
  MOCK_DB[truckId] ?? { TruckId: truckId, DownloadsLinks: [], Id: null };

/** Endpoints */
const TRUCK_ENDPOINT = (id) =>
  `https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/appointment/truck/${id}`;

const SIGN_BOL_ENDPOINT =
  "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/processbol";

/** Normalizer: supports BOTH old and new shapes */
function normalizeDocs(data) {
  if (!data) return [];

  // New shape: { message, downloadLinks: [{ salesOrderNumber, blobUrlLink }] }
  if (Array.isArray(data.downloadLinks)) {
    return data.downloadLinks
      .map((x, i) => ({
        so: x?.salesOrderNumber || `SO-${i + 1}`,
        url: x?.blobUrlLink || "",
      }))
      .filter((d) => !!d.url);
  }

  // Old shape: { DownloadsLinks: [{ SalesOrderNumber, Link }] }
  if (Array.isArray(data.DownloadsLinks)) {
    return data.DownloadsLinks
      .map((x, i) => ({
        so: x?.SalesOrderNumber || `SO-${i + 1}`,
        url: x?.Link || "",
      }))
      .filter((d) => !!d.url);
  }

  return [];
}

export default function SignBol() {
  const toast = useRef(null);

  // ----- Search form -----
  const [appointmentId, setAppointmentId] = useState("");
  const [truckId, setTruckId] = useState("");          // NEW: track truckId from GET
  const [signedBols, setSignedBols] = useState([]);

  // ----- Loaded docs + selections -----
  const [docs, setDocs] = useState([]); // [{so,url}]
  const [selectedDoc, setSelectedDoc] = useState(null); // for preview dialog
  const [selectedDocs, setSelectedDocs] = useState([]); // keeps your banner

  // ----- Backend identifiers / signed results -----
  const [driverCheckinId, setDriverCheckinId] = useState(null);

  // ----- UI states -----
  const [loading, setLoading] = useState(false);
  const [docDialogVisible, setDocDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [signedBolDialogVisible, setSignedBolDialogVisible] = useState(false);
  const [disablePrint, setDisablePrint] = useState(true);

  // ----- Signature pad -----
  const sigCanvas = useRef();

  const HAS_DOCS = docs.length > 0;

  // ====== Search ======
  const handleSearch = async () => {
    if (!appointmentId.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Truck/Appointment ID required",
        detail: "Please enter a valid ID.",
        life: 2500,
      });
      return;
    }

    setLoading(true);
    setDocs([]);
    setSelectedDocs([]);
    setSelectedDoc(null);
    setSignedBols([]);
    setDisablePrint(true);

    try {
      let data;
      if (USE_MOCK) {
        data = mockStatusResponse(appointmentId.trim());
      } else {
        const res = await axios.get(TRUCK_ENDPOINT(appointmentId.trim()));
         console.log( "teh res from get is " ,res)
        data = res?.data;
        console.log( "teh data from get is " ,data)
      }

      // set truckId from response if available; else fallback to input
      setTruckId(data?.TruckId || appointmentId.trim());

      console.log( "truckid",truckId )

      // capture an Id if your older shape provides it (new shape doesn't)
      const cid = data?.Id ?? data?.id ?? null;
      setDriverCheckinId(cid);

      const normalized = normalizeDocs(data);
      setDocs(normalized);
      setSelectedDocs(normalized);

      if (normalized.length === 0) {
        toast.current.show({
          severity: "info",
          summary: "No BOLs",
          detail: "No Bill of Lading documents found for this truck.",
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

      setSelectedDoc(normalized[0]);
      setDialogTitle(`Documents for ${appointmentId.trim()}`);
    } catch (er) {
      console.error("Error fetching data:", er);
      const msg =
        er?.response?.data?.message || er?.message || "Unable to fetch status.";
      toast.current.show({
        severity: "error",
        summary: "Fetch failed",
        detail: msg,
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  // ====== Signature actions ======
  const handleClearSignature = () => {
    sigCanvas.current?.clear();
  };

  // const handleSubmit = async () => {
  //   if (!appointmentId.trim()) {
  //     toast.current.show({
  //       severity: "warn",
  //       summary: "Missing Truck/Appointment ID",
  //       detail: "Please enter an ID before submitting.",
  //       life: 3000,
  //     });
  //     return;
  //   }
  //   if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
  //     toast.current.show({
  //       severity: "info",
  //       summary: "Signature Required",
  //       detail: "Please sign inside the box before submitting.",
  //       life: 3000,
  //     });
  //     return;
  //   }

  //   // collect from the docs loaded in handleSearch()
  //   const sos = (docs || []).map((d) => d.so).filter(Boolean);
  //   const links = (docs || []).map((d) => d.url).filter(Boolean);

  //   if (sos.length === 0) {
  //     toast.current.show({
  //       severity: "warn",
  //       summary: "No Sales Orders",
  //       detail: "Load Sales Orders for this Truck ID before signing.",
  //       life: 3000,
  //     });
  //     return;
  //   }

  //   try {
  //     const dataUrl = sigCanvas.current.toDataURL("image/png");
  //     const blob = await fetch(dataUrl).then((res) => res.blob());

  //     const formData = new FormData();
  //     formData.append("TruckId", (truckId || appointmentId).trim());
  //     if (driverCheckinId != null) formData.append("Id", driverCheckinId);

  //     // repeat keys for arrays (works with ASP.NET Core/Node)
  //     sos.forEach((so) => formData.append("sos", so));
  //     links.forEach((u) => formData.append("links", u));

  //     formData.append("PngImage", blob, "signature.png");

  //     // debug
  //     // for (const [k, v] of formData.entries()) {
  //     //   console.log(k, v instanceof File ? `${v.name} (${v.type})` : v);
  //     // }

  //     const response = await axios.post(SIGN_BOL_ENDPOINT, formData, {
  //       headers: { Accept: "application/json" }, // let browser set multipart boundary
  //     });

  //     // expected: { signed: [{ SalesOrderNumber, SignedLink }, ...] }
  //     const signed = Array.isArray(response?.data?.signed)
  //       ? response.data.signed
  //           .map((x) => ({ so: x?.SalesOrderNumber, url: x?.SignedLink }))
  //           .filter((x) => x.so && x.url)
  //       : [];

  //     if (signed.length > 0) {
  //       setSignedBols(signed);
  //       setDisablePrint(false);
  //       sigCanvas.current.clear();
  //       toast.current.show({
  //         severity: "success",
  //         summary: "Signed",
  //         detail: `Signed ${signed.length} BOL(s) successfully.`,
  //         life: 4000,
  //       });
  //       setSignedBolDialogVisible(true); // open immediately
  //     } else {
  //       toast.current.show({
  //         severity: "warn",
  //         summary: "No Signed BOLs Returned",
  //         detail:
  //           response?.data?.message ||
  //           "Server did not return any signed documents.",
  //         life: 4000,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("❌ Error submitting signature:", error);
  //     const msg =
  //       error?.response?.data?.message ||
  //       error?.response?.data ||
  //       "Could not submit signature. Please try again.";
  //     toast.current.show({
  //       severity: "error",
  //       summary: "Submission Failed",
  //       detail: msg,
  //       life: 4000,
  //     });
  //   }
  // };

  // ====== View / Print (per-doc + signed BOL) ======
 
 
// const handleSubmit = async () => {
//   if (!appointmentId.trim()) {
//     toast.current.show({
//       severity: "warn",
//       summary: "Missing Truck/Appointment ID",
//       detail: "Please enter an ID before submitting.",
//       life: 3000,
//     });
//     return;
//   }
//   if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
//     toast.current.show({
//       severity: "info",
//       summary: "Signature Required",
//       detail: "Please sign inside the box before submitting.",
//       life: 3000,
//     });
//     return;
//   }

//   // Collect BOL links from the search result
//   const links = (docs || [])
//     .map(d => d.url)
//     .filter(Boolean);

//   if (links.length === 0) {
//     toast.current.show({
//       severity: "warn",
//       summary: "No BOLs",
//       detail: "Load BOL documents for this Truck ID before signing.",
//       life: 3000,
//     });
//     return;
//   }

//   try {
//     // Get PNG blob from the signature pad
//     const dataUrl = sigCanvas.current.toDataURL("image/png");
//     const blob = await fetch(dataUrl).then(res => res.blob());

//     // Build multipart/form-data per backend contract
//     const form = new FormData();
//     const truck = (truckId || appointmentId).trim();

//     const metaPayload = {
//   BlobLinks: links,      // the BOL links you collected
//   TruckId: truck         // <-- add this
//   // optionally: truckId: truck  // add if your API expects lower-camel
// };

// const dumpFormData = (fd) => {
//   console.group("FormData preview");
//   for (const [k, v] of fd.entries()) {
//     if (v instanceof File) {
//       console.log(k, { name: v.name, type: v.type, size: v.size });
//     } else {
//       console.log(k, v);
//     }
//   }
//   console.groupEnd();
// };


// console.log("metaPayload (object)", metaPayload);
// console.log("metaJson (string)", JSON.stringify(metaPayload));
//     // IMPORTANT: field name must be exactly 'pngSing' as per your cURL
//     form.append("pngSing", blob, "signature.png");
//     form.append("metaJson",metaPayload);

//     dumpFormData(form); 

//     console.log( "form data", form)

//     // Debug (optional)
//     for (const [k,v] of form.entries()) console.log(k, v instanceof File ? v.name : v);

//     const response = await axios.post(SIGN_BOL_ENDPOINT, form, {
//       // Let the browser set the boundary; don't set Content-Type yourself
//       headers: { Accept: "application/json, text/plain" },
//     });

//     console.log( "Response from signed BOLS", response)
//     // Response can be JSON with { blobPdfLink } (sometimes servers reply text/plain)
//     const combinedUrl =
//       response?.data?.blobPdfLink ||
//       response?.data?.BlobPdfLink ||
//       (typeof response?.data === "string" ? response.data : "");

//       console.log("combinedUrl",combinedUrl )
//     if (combinedUrl) {
//       // Show in your existing multi-view dialog by treating as a single item
//       setSignedBols([{ so: "Combined", url: combinedUrl }]);
//       setDisablePrint(false);
//       sigCanvas.current.clear();

//       toast.current.show({
//         severity: "success",
//         summary: "Signed",
//         detail: "Combined signed BOL generated.",
//         life: 4000,
//       });

//       setSignedBolDialogVisible(true);
//     } else {
//       toast.current.show({
//         severity: "warn",
//         summary: "No PDF Returned",
//         detail: response?.data?.message || "Server did not return a signed PDF link.",
//         life: 4000,
//       });
//     }
//   } catch (error) {
//     console.error("❌ Error submitting signature:", error);
//     const msg =
//       error?.response?.data?.message ||
//       error?.response?.data ||
//       "Could not submit signature. Please try again.";
//     toast.current.show({
//       severity: "error",
//       summary: "Submission Failed",
//       detail: msg,
//       life: 4000,
//     });
//   }
// };

const handleSubmit = async () => {
  // --- guards ---
  if (!appointmentId.trim()) {
    toast.current.show({
      severity: "warn",
      summary: "Missing Truck/Appointment ID",
      detail: "Please enter an ID before submitting.",
      life: 3000,
    });
    return;
  }
  if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
    toast.current.show({
      severity: "info",
      summary: "Signature Required",
      detail: "Please sign inside the box before submitting.",
      life: 3000,
    });
    return;
  }

  // Collect BOL links from search results
  const links = (docs || [])
    .map(d => (d?.url || "").trim().replace(/^"|"$/g, "")) // strip any stray quotes
    .filter(Boolean);

  if (links.length === 0) {
    toast.current.show({
      severity: "warn",
      summary: "No BOLs",
      detail: "Load BOL documents for this Truck ID before signing.",
      life: 3000,
    });
    return;
  }

  // Helper: extract a readable error message from ASP.NET ProblemDetails or plain text
  const toErrorMessage = (err) => {
    const pd = err?.response?.data;
    if (!pd) return err?.message || "Bad Request";
    if (typeof pd === "string") return pd;
    const pieces = [];
    if (pd.title) pieces.push(pd.title);
    if (pd.detail) pieces.push(pd.detail);
    if (pd.errors) {
      const all = Object.values(pd.errors).flat().join(" | ");
      if (all) pieces.push(all);
    }
    return pieces.join(" — ") || "Bad Request";
  };

  try {
    // Signature -> File
    const dataUrl = sigCanvas.current.toDataURL("image/png");
    const blob = await fetch(dataUrl).then(res => res.blob());
    const file = new File([blob], "signature.png", { type: "image/png" });

    // Backend requires 3 distinct fields:
    //   TruckId: string
    //   pngSing: file/binary
    //   metaJson: string (JSON body with BlobLinks)
    const truck = (truckId || appointmentId).trim();
    const metaJson = JSON.stringify({ BlobLinks: links });

    const form = new FormData();
    form.append("TruckId", truck);            // ✅ required
    form.append("pngSing", file, file.name);  // ✅ required (field name must be EXACT)
    form.append("metaJson", metaJson);        // ✅ required (must be a STRING)

    // Debug preview (safe)
    console.group("FormData preview");
    for (const [k, v] of form.entries()) {
      console.log(k, v instanceof File ? { name: v.name, type: v.type, size: v.size } : v);
    }
    console.groupEnd();

    const response = await axios.post(SIGN_BOL_ENDPOINT, form, {
      // Let the browser set multipart boundaries; only set Accept
      headers: { Accept: "text/plain, application/json" },
    });

    // Server may return JSON { blobPdfLink } or text/plain (URL)
    let combinedUrl =
      response?.data?.blobPdfLink ||
      response?.data?.BlobPdfLink ||
      (typeof response?.data === "string" ? response.data : "");

    // If plain text was actually JSON as string, try to parse
    if (!combinedUrl && typeof response?.data === "string") {
      try {
        const parsed = JSON.parse(response.data);
        combinedUrl = parsed?.blobPdfLink || parsed?.BlobPdfLink || "";
      } catch (_) {}
    }

    // As a last resort, if the whole payload is a URL
    if (!combinedUrl && typeof response?.data === "string" && /^https?:\/\//i.test(response.data)) {
      combinedUrl = response.data;
    }

    if (combinedUrl) {
      setSignedBols([{ so: "Combined", url: combinedUrl }]); // show combined signed PDF
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
    // open all signed BOLs in new tabs (or choose just the first)
    signedBols.forEach((d) => window.open(d.url, "_blank", "noopener,noreferrer"));
  };

  return (
    <div
      style={{
        padding: "1rem",
        minHeight: "100dvh",
        backgroundColor: "rgb(214, 230, 197)",
      }}
    >
      {/* Search */}
      <div className="grid formgrid p-fluid mb-3">
        <div className="field col-12 md:col-6">
          <InputText
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            placeholder="Enter Truck/Appointment ID"
            className="w-full"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="field col-12 md:col-3">
          <Button
            label={loading ? "Searching…" : "Search"}
            icon="pi pi-search"
            className="w-full"
            style={{ background: "#0a4323", borderColor: "#eaf6de" }}
            onClick={handleSearch}
            disabled={loading}
          />
        </div>
      </div>

      {/* Docs grid */}
      <h3 style={{ marginBottom: "0.75rem" }}>
        Documents:{" "}
        <span style={{ color: docs.length ? "green" : "red" }}>
          {docs.length ? `${docs.length} found` : "None"}
        </span>
      </h3>

      {!!docs.length && (
        <div
          className="grid"
          style={{ gap: 10, alignItems: "stretch", marginBottom: 16 }}
        >
          {docs.map((d, idx) => (
            <div
              key={`${d.so}-${idx}`}
              className="col-12 md:col-6 lg:col-4"
              style={{
                border: "1px solid #c7d8c7",
                borderRadius: 8,
                padding: 12,
                background: "#fff",
                display: "grid",
                gap: 8,
                width: "160px",
              }}
            >
              <div style={{ fontWeight: 700 }}>SO: {d.so}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  label="View BOL"
                  icon="pi pi-eye"
                  className="p-button-sm"
                  onClick={() => openPreview(d)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner */}
      <h3 style={{ marginBottom: "2rem" }}>
        Document View Status:{" "}
        <span style={{ color: selectedDocs.length ? "green" : "red" }}>
          {selectedDocs.length ? "Document Viewed" : "Not Viewed"}
        </span>
      </h3>

      {/* Signature */}
      <div className="mt-4">
        <h4>Sign Below</h4>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "1rem",
            backgroundColor: "#ffffff",
          }}
        >
          <SignatureCanvas
            ref={sigCanvas}
            style={{ backgroundColor: "#f8f8f8" }}
            penColor="black"
            canvasProps={{ width: 700, height: 200, className: "sigCanvas" }}
          />
        </div>

        <div className="grid mt-3">
          <div className="col-12 md:col-3">
            <Button
              label="Clear"
              icon="pi pi-times"
              className="p-button-secondary w-full"
              onClick={handleClearSignature}
            />
          </div>

          <div className="col-12 md:col-3">
            <Button
              label="Submit"
              icon="pi pi-check"
              className="p-button-success w-full"
              disabled={!HAS_DOCS}
              onClick={handleSubmit}
            />
          </div>

          <div className="col-12 md:col-3">
            <Button
              label="View Signed BOL(s)"
              icon="pi pi-eye"
              className="p-button-info w-full"
              disabled={!signedBols.length}
              onClick={handleViewSigned}
            />
          </div>

          <div className="col-12 md:col-3">
            <Button
              label="Print Signed BOL(s)"
              icon="pi pi-print"
              className="p-button-help w-full"
              disabled={!signedBols.length || disablePrint}
              onClick={handlePrintSigned}
            />
          </div>
        </div>
      </div>

      {/* BOL preview (single) */}
      <Dialog
        header={
          dialogTitle ||
          (selectedDoc?.so ? `Document — ${selectedDoc.so}` : "Document Preview")
        }
        visible={docDialogVisible}
        onHide={() => setDocDialogVisible(false)}
        style={{ width: "70vw", height: "80vh" }}
        breakpoints={{ "1024px": "75vw", "641px": "100vw" }}
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

      {/* Signed BOLs preview (multiple) */}
      <Dialog
        header="Signed BOLs"
        visible={signedBolDialogVisible}
        onHide={() => setSignedBolDialogVisible(false)}
        style={{ width: "70vw", height: "80vh" }}
        breakpoints={{ "1024px": "75vw", "641px": "100vw" }}
        maximizable
      >
        {signedBols.length ? (
          <div
            style={{ display: "grid", gap: 12, height: "100%", overflow: "auto" }}
          >
            {signedBols.map((doc, i) => (
              <div key={i} style={{ height: "80vh" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
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

      <Toast ref={toast} />
    </div>
  );
}
