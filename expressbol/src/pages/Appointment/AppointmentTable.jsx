import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "../Appointment/AppointmentTable.module.css";

// -------------------------- COMPONENT --------------------------
export default function AppointmentTable() {
  const toast = useRef(null);
  const [data, setData] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  const [expandedRows, setExpandedRows] = useState(null);
  const [allExpanded, setAllExpanded] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [docDialogVisible, setDocDialogVisible] = useState(false);
  const [showStatusTable, setShowStatusTable] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [selectedRowDataToShowInDialog, setSelectedRowDataToShowInDialog] =
    useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(" ")
const [salesOrderDetails, setSalesOrderDetails] = useState({});
const [checkinid, setCheckinid] = useState('0')


  // -------------------------- FETCH DATA --------------------------
 useEffect(() => {
  fetchData();

  const interval = setInterval(() => {
    console.log("🔄 Auto-refreshing appointment data...");
    fetchData();
  }, 15000); 

  return () => clearInterval(interval); // cleanup on unmount
}, []);

  async function fetchData() {
      try {
        console.log("Fetching Admin data...");
        const res = await axios.get(
          "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin"
        );
  
        setData(res.data);
       
      } catch (er) {
        console.error("Fetch error:", er);
        toast.current?.show({
          severity: "error",
          summary: "Network Error",
          detail: er.message,
        });
      }
    }

  // -------------------------- MOCK DATA (fallback) --------------------------
  const mockAppointments = [
    
  ];

  // -------------------------- FILTERING --------------------------
  const filteredData = (data?.length ? data : mockAppointments).filter((row) => {
    const matchesId =
      !filterValue ||
      row.appointmentId?.toString().includes(filterValue.toString());
    const matchesStatus = !filterStatus || row.status === filterStatus;
    return matchesId && matchesStatus;
  });

  // -------------------------- DROPDOWN OPTIONS --------------------------
  const statusOptions = [
    { label: "Queued", value: "Queued" },
    { label: "CheckedIn", value: "CheckedIn" },
    { label: "DockAssigned", value: "DockAssigned" },
    { label: "SignBOL", value: "SignBOL" },
    { label: "CheckedOut", value: "CheckedOut" },
  ];

  // -------------------------- ACTIONS --------------------------
  const openDialogPopup = (rowData) => (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        icon="pi pi-eye"
        className="p-button-text"
        onClick={() => {
          setDialogTitle("Sales Orders for " + rowData.driverName);
          setSelectedRowDataToShowInDialog(rowData.salesOrders || []);
          setSelectedAppointmentId(rowData.appointmentId);
          setCheckinid(rowData.driverCheckInId);
          setShowStatusTable(true);
        }}
      />
    </div>
  );

const handleCompleteCheckIn = async () => {
  try {
    if (!selectedAppointmentId || !checkinid) {
      toast.current?.show({
        severity: "warn",
        summary: "Missing Data",
        detail: "No Appointment ID or Driver Check-In ID found for update.",
      });
      return;
    }

    const payload = {
      driverCheckInId: parseInt(checkinid, 10), // backend expects number
      appointmetnId: selectedAppointmentId.trim(), // note: spelling matches backend
      salesIds: (selectedRowDataToShowInDialog || [])
        .filter((s) => s.salesOrderId)
        .map((s) => s.salesOrderId),
    };

    console.log("🔹 Sending PATCH payload:", payload);

    const response = await axios.patch(
      "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Server Response:", response.data);

    setData((prevData) =>
      prevData.map((row) =>
        row.driverCheckInId === checkinid
          ? {
              ...row,
              appointmentId: payload.appointmetnId, // optional: reflect update
              salesOrderIds: payload.salesIds.join(", "),
              status: "CheckedIn",
            }
          : row
      )
    );

    toast.current?.show({
      severity: "success",
      summary: "Check-In Completed",
      detail: `DriverCheckin details updated successfully.`,
    });

    await fetchData(); // pulls the latest state from API

// ✅ Step 2: Reset local dialog state
setShowStatusTable(false);
setSelectedRowDataToShowInDialog([]);
setSelectedAppointmentId("");
setCheckinid("");
setSalesOrderDetails({});

  } catch (error) {
    console.error("❌ Error during Complete Check-In:", error);
    toast.current?.show({
      severity: "error",
      summary: "Update Failed",
      detail:
        error.response?.data?.message ||
        "Something went wrong while updating record.",
    });
  }
};

  async function fetchSalesOrderDetails(salesOrderId) {
  try {
    // call the API
    const response = await axios.get(
      `https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/${salesOrderId}`
    );


    console.log("Response for the Sales order details",response)
    // update local state: store items for that order
    setSalesOrderDetails((prev) => ({
      ...prev,
      [salesOrderId]: response.data.salesOrderItems,
    }));

    console.log("Fetched order details for", salesOrderId, response.data);
  } catch (err) {
    console.error("Failed to fetch order details:", err);
    toast.current?.show({
      severity: "error",
      summary: "Fetch failed",
      detail: `There is no Sales order with id :  ${salesOrderId}`,
    });
  }
}

  const documentsBodyTemplate = (rowData) => (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        icon="pi pi-file"
        className="p-button-text"
        onClick={() => {
          setSelectedDocs([
            {
              name: "BOL Document 1",
              url: "https://mojodemostorageaccount.blob.core.windows.net/testmojo/Bill%20of%20lading%20(laser%20printed)%20(1).pdf",
            },
          ]);
          setDialogTitle("Documents for " + rowData.driverName);
          setDocDialogVisible(true);
        }}
      />
    </div>
  );

  const toggleRows = () => {
    if (allExpanded) {
      setExpandedRows(null);
      setAllExpanded(false);
    } else {
      let newExpandedRows = {};
      (selectedRowDataToShowInDialog || []).forEach(
        (p) => (newExpandedRows[p?.salesOrderId] = true)
      );
      setExpandedRows(newExpandedRows);
      setAllExpanded(true);
    }
  };

  const handleDeleteRow = (rowData) => {
  const updated = selectedRowDataToShowInDialog.filter(
    (item) => item.salesOrderId !== rowData.salesOrderId
  );

  setSelectedRowDataToShowInDialog(updated);

  // 🔁 Update main appointment table
  setData((prevData) =>
    prevData.map((row) =>
      row.appointmentId === selectedAppointmentId
        ? {
            ...row,
            salesOrders: updated,
            salesOrderIds: updated.map((s) => s.salesOrderId).join(", "),
          }
        : row
    )
  );

  toast.current?.show({
    severity: "warn",
    summary: "Sales Order Deleted",
    detail: `Sales Order ${rowData.salesOrderId} deleted successfully.`,
  });
};


const onRowEditComplete = async (e) => {
  const { newData, index } = e;
  const oldData = selectedRowDataToShowInDialog[index];
  const newSO = newData.salesOrderId?.trim();

  // 🚫 Block immediately if empty
  if (!newSO) {
    toast.current?.show({
      severity: "warn",
      summary: "Missing Sales Order ID",
      detail: "Please enter a valid Sales Order ID before saving.",
    });
    return;
  }

  try {
    // 🔹 Validate the Sales Order from backend
    const response = await axios.get(
      `https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin/${newSO}`
    );

    if (!response.data?.salesOrderItems?.length) {
      toast.current?.show({
        severity: "error",
        summary: "Invalid Sales Order",
        detail: `No line items found for Sales Order ID: ${newSO}`,
      });
      return;
    }

    // ✅ Validation passed → Update table
    const updated = [...selectedRowDataToShowInDialog];
    updated[index] = newData;
    setSelectedRowDataToShowInDialog(updated);

    // Store order line items
    setSalesOrderDetails((prev) => ({
      ...prev,
      [newSO]: response.data.salesOrderItems,
    }));

    toast.current?.show({
      severity: "success",
      summary: "Sales Order Validated",
      detail: `Fetched ${response.data.salesOrderItems.length} items for ${newSO}`,
    });

  } catch (err) {
    console.error("Validation failed:", err);
    toast.current?.show({
      severity: "error",
      summary: "Invalid Sales Order",
      detail: `Sales Order ${newSO} not found in backend.`,
    });
    // 🚫 No state update here (row remains unchanged)
    return;
  }
};



  const textEditor = (options) => (
    <InputText
      value={options.value}
      onChange={(e) => options.editorCallback(e.target.value)}
      className="w-full"
    />
  );


  const salesOrderExpansionTemplate = (rowData) => {
  const items = salesOrderDetails[rowData.salesOrderId];

  if (!items) {
    // not yet loaded
    return (
      <div style={{ padding: "1rem" }}>
        {/* <i className="pi pi-spin pi-spinner" style={{ marginRight: "8px" }}></i> */}
        Could not load details for {rowData.salesOrderId}
      </div>
    );
  }

  // Once loaded, render the nested DataTable
  return (
    <div style={{ padding: "1rem" }}>
      <DataTable
        value={items}
        responsiveLayout="scroll"
        showGridlines
        stripedRows
      >
        <Column field="itemId" header="Item ID" style={{ minWidth: "8rem" }} />
        <Column field="description" header="Description" style={{ minWidth: "25rem" }} />
        <Column field="salesQuantity" header="Sales Qty" style={{ minWidth: "8rem" }} />
        <Column field="quantity" header="Quantity" style={{ minWidth: "8rem" }} />
        <Column field="weight" header="Weight" style={{ minWidth: "8rem" }} />
      </DataTable>
    </div>
  );
};

  // -------------------------- COLUMN DEFINITIONS --------------------------
  const headerColumns = [
    { field: "appointmentId", header: "Appointment ID", minWidth: "14rem" },
    { field: "salesOrderIds", header: "SO–Numbers", minWidth: "14rem" },
    { field: "driverName", header: "Driver Name", minWidth: "14rem" },
    { field: "mobileNumber", header: "Driver Number", minWidth: "12rem" },
    { field: "status", header: "Status", minWidth: "10rem" },
    { field: "completeCheckin", header: "Complete Check-in", minWidth: "10rem" },
    { field: "viewBOL", header: "View BOL", minWidth: "10rem" },
    { field: "driverCheckInTime", header: "Driver Queued Time", minWidth: "14rem" },
    { field: "lastUpdatedDateUtc", header: "Last Updated (PST)", minWidth: "14rem" },
    { field: "lastUpdatedBy", header: "Last Updated By", minWidth: "12rem" },
  ];

  // -------------------------- JSX --------------------------
  return (
    <div style = {{backgroundImage: 'url("/images/image.png")',
        backgroundRepeat: "repeat",
        backgroundSize: "520px auto",
        backgroundPosition: "top center",backgroundColor: "rgb(214, 230, 197)" }}>
      <Toast ref={toast} />

      {/* Filters */}
      <div className="grid formgrid p-fluid mb-3 md:pt-2 ">
        <div className="field col-12 md:col-3">
          <InputText
            placeholder="Appointment Id"
            className={`w-full p-inputtext-sm ${styles.inputFocus}`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>

        <div className="field col-12 md:col-3">
          <Calendar
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.value)}
            placeholder="Start Date"
            className={`w-full p-inputtext-sm ${styles.calendarFocus}`}
            dateFormat="mm-dd-yy"
            maxDate={filterEndDate}
          />
        </div>

        <div className="field col-12 md:col-3">
          <Calendar
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.value)}
            placeholder="End Date"
            className={`w-full p-inputtext-sm ${styles.calendarFocus}`}
            dateFormat="mm-dd-yy"
            minDate={filterStartDate}
          />
        </div>

        <div className="field col-12 md:col-3">
          <Dropdown
            showClear
            className={`w-full p-inputtext-sm ${styles.dropdownFocus}`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.value)}
            options={statusOptions}
            placeholder="Select Status"
          />
        </div>

        <div className="field col-6 md:col-2 md:col-offset-8">
           <Button
            label="Search"
            icon="pi pi-search"
            className={`p-button-sm w-full ${styles.button}`}
            style={{ background: "#0a4323" }}
            onClick={() => {
              toast.current?.show({
                severity: "info",
                summary: "Search Clicked",
                detail: "Filter logic can be added here",
              });
            }}
          />
        </div>

        <div className="field col-6 md:col-2">
          <Button
            label="Reset"
            icon="pi pi-refresh"
            className={`p-button-sm w-full p-button-secondary ${styles.button}`}
            style={{
              background: "#eaf6de",
              borderColor: "#23633f",
              color: "#000",
            }}
            onClick={() => {
              setFilterValue("");
              setFilterStatus(null);
              setFilterStartDate(null);
              setFilterEndDate(null);
            }}
          />
        </div>
      </div>

      {/* Main Data Table */}
      <div
        style={{
          maxHeight: "100lvh",
          overflow: "auto",
          marginBottom: "1rem",
          borderRadius: "8px",
        }}
      >
        <DataTable
          value={filteredData}
          paginator
          dataKey="driverCheckInId"
          scrollHeight="30vw"
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          emptyMessage="No records found."
          className={styles.datatable}
          editMode="row"
          onRowEditComplete={onRowEditComplete}
        >
          {headerColumns.map((col, index) => (
            <Column
              key={index}
              field={col.field}
              header={col.header}
              sortable
              style={{ minWidth: col.minWidth }}
              headerStyle={{ minWidth: col.minWidth }}
              body={
                col.field.toLowerCase() === "completecheckin"
                  ? openDialogPopup
                  : col.field.toLowerCase() === "viewbol"
                  ? documentsBodyTemplate
                  : col.value
              }
              editor={
                col.field === "appointmentId"
                  ? textEditor
                  : undefined
              }
            />
          ))}

          <Column
            rowEditor
            headerStyle={{ width: "8rem" }}
            bodyStyle={{ textAlign: "center" }}
          />
        </DataTable>
      </div>

      {/* Document Dialog */}
      <Dialog
        header={dialogTitle || "BOL Document"}
        visible={docDialogVisible}
        onHide={() => setDocDialogVisible(false)}
        style={{ width: "80vw", height: "80vh" }}
        breakpoints={{ "1024px": "75vw", "641px": "100vw" }}
        maximizable
      >
        {selectedDocs.map((doc, i) => (
          <iframe
            key={i}
            src={doc.url}
            width="100%"
            height="100%"
            style={{ border: "none", marginBottom: "1rem" }}
            title={doc.name}
          />
        ))}
      </Dialog>

      {/* Sales Orders Dialog */}
      <Dialog
        header={"Sales Orders Status"}
        visible={showStatusTable}
        onHide={() => setShowStatusTable(false)}
        style={{ width: "75%" }}
        breakpoints={{ "960px": "95vw" }}
      >
   <div
  className="field col-12 md:col-3"
  style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}
>
  <label style={{ fontWeight: "bold", color: "#0a4323" }}>Appointment ID</label>
  <InputText
    value={selectedAppointmentId || ""}
    onChange={(e) => {
      const newId = e.target.value;
      setSelectedAppointmentId(newId);

      // ✅ Example: Update status or trigger backend update when ID changes
      // If you have a function like setStatus(appointmentId)
      if (newId.trim() !== "") {
        // You can call your API here or a handler function
        console.log("Appointment ID changed to:", newId);
        // setStatus(newId);  // <-- your actual logic
      }
    }}
    className={`w-full p-inputtext-sm ${styles.inputFocus}`}
    placeholder="Appointment ID"
    style={{ fontWeight: "bold", color: "#000" }}
  />
</div>


        {selectedRowDataToShowInDialog?.length >= 0 ? (
          <div
            style={{
              maxHeight: "400px",
              overflow: "auto",
              marginBottom: "1rem",
              borderRadius: "8px",
            }}
          >
            <DataTable
              value={selectedRowDataToShowInDialog}
              paginator
              dataKey="salesOrderId"
              scrollHeight="30vw"
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rows={10}
              rowsPerPageOptions={[5, 10, 20, 50, 100]}
              emptyMessage="No records found."
              className={styles.datatable}
              editMode="row"
              onRowEditComplete={onRowEditComplete}
              onRowExpand={(e) => fetchSalesOrderDetails(e.data.salesOrderId)}
              onRowCollapse={(e) => {
  console.log("Collapsed:", e.data.salesOrderId);
}}
rowExpansionTemplate={salesOrderExpansionTemplate}
              footer={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    background: "#faffef",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <Button
                    label="Add"
                    icon="pi pi-plus"
                    style={{
                      background: "#faffef",
                      borderColor: "#4a7c59",
                      color: "#000",
                    }}
                    onClick={() => {
                      const newRow = {
                        salesOrderId: null,
                        totalQuantity: null,
                        totalWeight: null,
                      };
                      setSelectedRowDataToShowInDialog([
                        ...selectedRowDataToShowInDialog,
                        newRow,
                      ]);
                    }}
                  />
                  <Button
  label="Delete"
  icon="pi pi-minus"
  style={{
    background: "#faffef",
    borderColor: "#4a7c59",
    color: "#000",
  }}
  onClick={() => {
    // If you want to delete the *last* sales order row:
    if (selectedRowDataToShowInDialog.length > 0) {
      const updated = [...selectedRowDataToShowInDialog];
      updated.pop(); // removes last one
      setSelectedRowDataToShowInDialog(updated);

      // 🔁 Also update in main appointment data
      setData((prevData) =>
        prevData.map((row) =>
          row.appointmentId === selectedAppointmentId
            ? {
                ...row,
                salesOrders: updated,
                salesOrderIds: updated.map((s) => s.salesOrderId).join(", "),
              }
            : row
        )
      );

      toast.current?.show({
        severity: "warn",
        summary: "Deleted Last Sales Order",
        detail: "Last Sales Order removed successfully.",
      });
    } else {
      toast.current?.show({
        severity: "info",
        summary: "No Rows",
        detail: "There are no sales orders to delete.",
      });
    }
  }}
/>
                  <Button
                    label="Complete Check-In"
                    icon="pi pi-check"
                    style={{
                      background: "#4a7c59",
                      borderColor: "#eaf6de",
                      color: "#fff",
                      minWidth: "180px",
                    }}
                    onClick={() => {
                      handleCompleteCheckIn()
                    }
                  }
                  />
                </div>
              }
            >
              <Column
                header={
                  <Button
                    className={
                      allExpanded ? "pi pi-angle-down" : "pi pi-angle-right"
                    }
                    style={{
                      fontSize: "1.3rem",
                      color: "#6c757d",
                      backgroundColor: "#eaf6de",
                      border: "none",
                      padding: "2px",
                    }}
                    onClick={toggleRows}
                  ></Button>
                }
                style={{ width: "10px" }}
                expander
              />
              <Column
                field="salesOrderId"
                header="Sales Order Id"
                style={{ minWidth: "20rem" }}
                editor={textEditor}
              />
              <Column
                field="totalQuantity"
                header="Total Item Qty"
                style={{ minWidth: "10rem" }}
              />
              <Column
                field="totalWeight"
                header="Total Weight"
                style={{ minWidth: "10rem" }}
              />
              <Column
                rowEditor
                headerStyle={{ width: "10%", minWidth: "8rem" }}
                bodyStyle={{ textAlign: "center" }}
              />
            </DataTable>
          </div>
        ) : (
          <p>No Records available</p>
        )}
      </Dialog>
    </div>
  );
}
