// src/pages/CheckinStatusTable.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "../Appointment/AppointmentTable.module.css";

// ===== Adjust these if your backend routes differ =====
const CHECKED_IN_API =
  "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/checkedIn";
const SALES_ORDER_DETAILS_API = (so) =>
  `https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/${so}`;
const VIEW_BOL_FIELD = "bolUrl"; // property on row with BOL link if any

export default function CheckinStatusTable() {
  const toast = useRef(null);

  const [rows, setRows] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [startDate, setStartDate] = useState(null); // filter by checked-in time
  const [endDate, setEndDate] = useState(null);

  const [docDialogVisible, setDocDialogVisible] = useState(false);
  const [docUrl, setDocUrl] = useState("");
  const [docTitle, setDocTitle] = useState("");

  const [expandedRows, setExpandedRows] = useState(null);
  const [salesOrderDetails, setSalesOrderDetails] = useState({}); // { soId: [items] }

  const statusOptions = [
    { label: "CheckedIn", value: "CheckedIn" },
    { label: "Packing_in_progress", value: "Packing_in_progress" },
    { label: "Dock_Assigned", value: "Dock_Assigned" },
    { label: "Docked", value: "Docked" },
    { label: "SignBOL", value: "SignBOL" },
    { label: "CheckedOut", value: "CheckedOut" },
  ];

  // ---- Fetch ----
  async function fetchData() {
    try {
      const res = await axios.get(CHECKED_IN_API);

      console.log( "data from fetch", res.data)
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (er) {
      console.error(er);
      toast.current?.show({
        severity: "error",
        summary: "Network Error",
        detail: er?.message || "Failed to fetch checked-in drivers",
      });
    }
  }

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 1500); // auto-refresh 15s
    return () => clearInterval(t);
  }, []);

  // ---- Helpers ----
  function inDateRange(dt) {
    if (!dt) return true;
    const t = new Date(dt);
    if (startDate && t < new Date(startDate)) return false;
    if (endDate && t > new Date(endDate)) return false;
    return true;
  }

  const filtered = useMemo(() => {
    const t = (filterText || "").toLowerCase().trim();
    return rows.filter((r) => {
      const matchesText =
        !t ||
        [r.driverName, r.mobileNumber, r.appointmentId, r.truckId, r.salesOrderIds]
          .map((x) => (x ? String(x).toLowerCase() : ""))
          .some((s) => s.includes(t));
      const matchesStatus = !filterStatus || r.status === filterStatus;
      const matchesDate = inDateRange(r.driverCheckInTime || r.checkedInTime);
      return matchesText && matchesStatus && matchesDate;
    });
  }, [rows, filterText, filterStatus, startDate, endDate]);

  async function fetchSalesOrderItems(salesOrderId) {
    try {
      const res = await axios.get(SALES_ORDER_DETAILS_API(salesOrderId));
      setSalesOrderDetails((prev) => ({
        ...prev,
        [salesOrderId]: res?.data?.salesOrderItems || [],
      }));
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "warn",
        summary: "SO Items",
        detail: `No line items for ${salesOrderId}`,
      });
    }
  }

  // ---- Column Templates ----
  const viewDocTemplate = (row) => {
    const url = row[VIEW_BOL_FIELD];
    if (!url) return null;
    return (
      <Button
        icon="pi pi-file"
        className="p-button-text"
        onClick={() => {
          setDocTitle(`BOL – ${row.appointmentId || row.truckId || row.driverName}`);
          setDocUrl(url);
          setDocDialogVisible(true);
        }}
      />
    );
  };

  const salesOrderListTemplate = (row) => {
    return (row.salesOrderIds || "")
      .toString()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
  };

  const salesOrderExpansionTemplate = (row) => {
    const so = String(row.salesOrderId || row.salesOrder || "").trim();
    const items = salesOrderDetails[so];
    if (!so) return <div style={{ padding: "1rem" }}>No Sales Order</div>;
    if (!items)
      return (
        <div style={{ padding: "1rem" }}>
          Could not load details for {so}
        </div>
      );
    return (
      <div style={{ padding: "1rem" }}>
        <DataTable value={items} showGridlines stripedRows responsiveLayout="scroll">
          <Column field="itemId" header="Item ID" style={{ minWidth: "8rem" }} />
          <Column field="description" header="Description" style={{ minWidth: "20rem" }} />
          <Column field="salesQuantity" header="Sales Qty" style={{ minWidth: "8rem" }} />
          <Column field="quantity" header="Quantity" style={{ minWidth: "8rem" }} />
          <Column field="weight" header="Weight" style={{ minWidth: "8rem" }} />
        </DataTable>
      </div>
    );
  };

  // ---- Header columns ----
  const headerColumns = [
    { field: "driverName", header: "Driver Name", minWidth: "14rem" },
    { field: "mobileNumber", header: "Mobile Number", minWidth: "12rem" },
    { field: "driverCheckInTime", header: "Checked-in Time", minWidth: "16rem" },
    { field: "salesOrderIds", header: "SO Numbers", minWidth: "16rem", body: salesOrderListTemplate },
    { field: "appointmentId", header: "Appointment ID", minWidth: "14rem" },
    { field: "truckId", header: "Truck ID", minWidth: "12rem" },
    { field: "status", header: "Status", minWidth: "12rem" },
    // { field: "viewBOL", header: "View BOL", minWidth: "8rem", body: viewDocTemplate },
  ];

  return (
    <div
      style={{
        // backgroundImage: 'url("/images/image2.png")',
        backgroundRepeat: "repeat",
        backgroundSize: "520px auto",
        backgroundPosition: "top center",
        backgroundColor: "rgb(214, 230, 197)",
        paddingBottom: "1rem",
      }}
    >
      <Toast ref={toast} />

      {/* Filters */}
      <div className="grid formgrid p-fluid mb-3 md:pt-2">
        <div className="field col-12 md:col-3">
          <InputText
            placeholder="Search (Driver/Truck/SO/Appt/Mobile)"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={`w-full p-inputtext-sm ${styles.inputFocus}`}
          />
        </div>

        <div className="field col-12 md:col-3">
          <Calendar
            value={startDate}
            onChange={(e) => setStartDate(e.value)}
            placeholder="Start Date (Checked-in)"
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
            placeholder="End Date (Checked-in)"
            className={`w-full p-inputtext-sm ${styles.calendarFocus}`}
            dateFormat="mm-dd-yy"
            minDate={startDate}
            showIcon
          />
        </div>

        <div className="field col-12 md:col-3">
          <Dropdown
            showClear
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.value)}
            options={statusOptions}
            placeholder="Filter by Status"
            className={`w-full p-inputtext-sm ${styles.dropdownFocus}`}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ maxHeight: "100lvh", overflow: "auto", marginBottom: "1rem", borderRadius: "8px" }}>
        <DataTable
          value={filtered}
          dataKey="driverCheckInId"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          emptyMessage="No checked-in drivers found."
          className={styles.datatable}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          onRowExpand={(e) => {
            // Try to expand the first SO in the row (if any)
            const firstSO = (e.data?.salesOrderIds || "")
              .toString()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)[0];
            if (firstSO) {
              setSalesOrderDetails((prev) => ({ ...prev, [firstSO]: prev[firstSO] || undefined }));
              fetchSalesOrderItems(firstSO);
            }
          }}
          rowExpansionTemplate={(row) => {
            // show SO items for each SO in a simple nested table
            const soList = (row.salesOrderIds || "")
              .toString()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            if (!soList.length) return <div style={{ padding: "1rem" }}>No Sales Orders</div>;
            return (
              <div style={{ padding: "0.5rem 1rem" }}>
                {soList.map((so) => (
                  <div key={so} style={{ marginBottom: "1rem", border: "1px solid #e6f2dd", borderRadius: 8 }}>
                    <div style={{ padding: "0.5rem 0.75rem", background: "#faffef", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong>Sales Order: {so}</strong>
                      <Button
                        icon="pi pi-refresh"
                        className="p-button-text"
                        onClick={() => fetchSalesOrderItems(so)}
                        title="Refresh items"
                      />
                    </div>
                    {salesOrderExpansionTemplate({ salesOrderId: so })}
                  </div>
                ))}
              </div>
            );
          }}
        >
          <Column expander style={{ width: "3rem" }} />
          {headerColumns.map((c, i) => (
            <Column
              key={i}
              field={c.field}
              header={c.header}
              style={{ minWidth: c.minWidth }}
              headerStyle={{ minWidth: c.minWidth }}
              sortable
              body={c.body}
            />
          ))}
        </DataTable>
      </div>

      {/* BOL Dialog */}
      <Dialog
        header={docTitle || "BOL Document"}
        visible={docDialogVisible}
        onHide={() => setDocDialogVisible(false)}
        style={{ width: "80vw", height: "80vh" }}
        breakpoints={{ "1024px": "75vw", "641px": "100vw" }}
        maximizable
      >
        {docUrl ? (
          <iframe
            src={docUrl}
            title="BOL"
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
