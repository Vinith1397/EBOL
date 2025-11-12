// src/pages/ArchiveBOL.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "../Appointment/AppointmentTable.module.css";

// ===== Adjust these if your backend routes differ =====
const ARCHIVE_API =
  "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/checkedOut"; // should return checked-out appointments with signed BOLs
const COMBINED_PDF_FIELD = "combinedBolUrl"; // property containing the combined signed BOL PDF url
const DATE_FIELD = "checkedOutTime"; // or lastUpdatedDateUtc, depends on your backend

export default function ArchiveBOL() {
  const toast = useRef(null);

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [docDialogVisible, setDocDialogVisible] = useState(false);
  const [docUrl, setDocUrl] = useState("");
  const [docTitle, setDocTitle] = useState("");

  async function fetchData() {
    try {
      const res = await axios.get(ARCHIVE_API);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (er) {
      console.error(er);
      toast.current?.show({
        severity: "error",
        summary: "Network Error",
        detail: er?.message || "Failed to fetch archive records",
      });
    }
  }

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 60000); // archive is slower moving; refresh every 60s
    return () => clearInterval(t);
  }, []);

  function inDateRange(dt) {
    if (!dt) return true;
    const t = new Date(dt);
    if (startDate && t < new Date(startDate)) return false;
    if (endDate && t > new Date(endDate)) return false;
    return true;
  }

  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase().trim();
    return rows.filter((r) => {
      const matchesText =
        !s ||
        [r.driverName, r.mobileNumber, r.truckId, r.salesOrderIds, r.appointmentId]
          .map((x) => (x ? String(x).toLowerCase() : ""))
          .some((v) => v.includes(s));
      const matchesDate = inDateRange(r[DATE_FIELD] || r.lastUpdatedDateUtc);
      return matchesText && matchesDate;
    });
  }, [rows, search, startDate, endDate]);

  const viewDocTemplate = (row) => {
    const url = row.blobUrl;
    if (!url) return null;
    return (
      <Button
        icon="pi pi-file-pdf"
        className="p-button-text"
        onClick={() => {
          setDocTitle(
            `Signed BOL – ${row.appointmentId || row.truckId || row.driverName}`
          );
          setDocUrl(url);
          setDocDialogVisible(true);
        }}
        title="View Signed BOL (combined PDF)"
      />
    );
  };

  const headerColumns = [
    { field: "driverName", header: "Driver Name", minWidth: "14rem" },
    { field: "mobileNumber", header: "Mobile", minWidth: "12rem" },
    { field: "truckId", header: "Truck ID", minWidth: "12rem" },
    { field: "salesOrderIds", header: "SO Numbers", minWidth: "14rem" },
    { field: "appointmentId", header: "Appointment ID", minWidth: "14rem" },
    { field: "driverCheckedOutTime", header: "Checked-out Time", minWidth: "16rem" },
    { field: "doc", header: "Document", minWidth: "10rem", body: viewDocTemplate },
    
  ];

  return (
    <div
      style={{
        // backgroundImage: 'url("/images/image.png")',
        backgroundRepeat: "repeat",
        backgroundSize: "520px auto",
        backgroundPosition: "top center",
        backgroundColor: "rgb(214, 230, 197)",
        paddingBottom: "1rem",
      }}
    >
      <Toast ref={toast} />

      {/* Filters */}
      <div className="grid formgrid p-fluid mb-3 md:pt-2 ">
        <div className="field col-12 md:col-4">
          <InputText
            placeholder="Search by Truck ID / SO / Appointment / Driver / Mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full p-inputtext-sm ${styles.inputFocus}`}
          />
        </div>

        <div className="field col-12 md:col-3">
          <Calendar
            value={startDate}
            onChange={(e) => setStartDate(e.value)}
            placeholder="Start Date"
            className={`w-full p-inputtext-sm ${styles.calendarFocus}`}
            dateFormat="mm-dd-yy"
            maxDate={endDate}
            showIcon
          />
        </div>

        <div className="field col-12 md:col-3">
          <Calendar
            value={endDate}
            onChange={(e) => setEndDate(e.value)}
            placeholder="End Date"
            className={`w-full p-inputtext-sm ${styles.calendarFocus}`}
            dateFormat="mm-dd-yy"
            minDate={startDate}
            showIcon
          />
        </div>

        <div className="field col-6 md:col-1 md:col-offset-1">
          <Button
            label="Reset"
            icon="pi pi-refresh"
            className={`p-button-sm w-full p-button-secondary ${styles.button}`}
            style={{ background: "#eaf6de", borderColor: "#23633f", color: "#000" }}
            onClick={() => {
              setSearch("");
              setStartDate(null);
              setEndDate(null);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ maxHeight: "100lvh", overflow: "auto", marginBottom: "1rem", borderRadius: 8 }}>
        <DataTable
          value={filtered}
          dataKey="driverCheckInId"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          emptyMessage="No archived BOLs found."
          className={styles.datatable}
        >
          {headerColumns.map((c, i) => (
            <Column
              key={i}
              field={c.field}
              header={c.header}
              sortable
              style={{ minWidth: c.minWidth }}
              headerStyle={{ minWidth: c.minWidth }}
              body={c.body}
            />
          ))}
        </DataTable>
      </div>

      {/* Document Dialog */}
      <Dialog
        header={docTitle || "Signed BOL (Combined PDF)"}
        visible={docDialogVisible}
        onHide={() => setDocDialogVisible(false)}
        style={{ width: "80vw", height: "80vh" }}
        breakpoints={{ "1024px": "75vw", "641px": "100vw" }}
        maximizable
      >
        {docUrl ? (
          <iframe
            src={docUrl}
            title="Signed BOL"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <p>No document.</p>
        )}
      </Dialog>
    </div>
  );
}
