
import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";

const ORDER = ["checked_in", "Packing_in_progress", "Dock_Assigned", "sign_bol", "admin_processing","Checked_out"];
const LABEL = {
  checked_in: "CHECKED-IN",
  Packing_in_progress: "PACKING IN PROGRESS",
  Dock_Assigned: "DOCK ASSIGNED",
  sign_bol: "SIGN BOL",
  admin_processing : "ADMIN PROCESSING",
  Checked_out: "CHECKED-OUT",
};

export default function StatusPage() {
  const { appointmentId } = useParams();
  const toast = useRef(null);

  const [data, setData] = useState({});
  const [status, setStatus] = useState("checked_in");

  const activeIndex = useMemo(() => Math.max(0, ORDER.indexOf(status)), [status]);
  const theme = { done: "#86b837", gray: "#d9d9d9", primary: "#c1ce09" };

  // --- Fetch status from API (replace endpoint) ---
  const fetchStatus = async () => {
    try {
      const { data } = await axios.get(
        `https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Appointment/status/${encodeURIComponent(appointmentId)}`
      );
      setData(data);
      setStatus(admin_processing);
    } catch {
         setStatus("ADMIN PROCESSING");
      toast.current?.show({
        severity: "warn",
        summary: "Network Error",
        detail: "Couldn't refresh status. Retrying...",
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 8000);
    return () => clearInterval(id);
  }, [appointmentId]);

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: theme.primary,
        padding: "1rem",
      }}
    >
      <Toast ref={toast} />
      <Card
        style={{
          width: "100%",
          maxWidth: "900px",
          borderRadius: "20px",
          padding: "1.5rem",
          background: "#f7fae3",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#000" }}>Loading Status</h2>
          <small>
            Appointment ID: <b>{appointmentId}</b>
          </small>
        </header>

        {/* === Progress Bar === */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "1rem 0 2rem 0",
            overflowX: "auto",
            padding: "0 1rem 0.5rem 1rem",
          }}
        >
          {/* Base line */}
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "calc(25px + 1rem)",
              right: "calc(65px + 0.5rem)",
              height: "3px",
              background: theme.gray,
              zIndex: 0,
            }}
          />
          {/* Filled portion */}
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "calc(35px + 1rem)",
              width: `calc(${(activeIndex / (ORDER.length - 1)) * 100}% - 0.5rem)`,
              height: "3px",
              background: theme.done,
              zIndex: 1,
              transition: "width 0.6s ease",
            }}
          />

          {ORDER.map((step, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            return (
              <div
                key={step}
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "60px",
                  flexShrink: 0,
                  marginRight: "20px"
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `3px solid ${isDone || isActive ? theme.done : theme.gray}`,
                    background: isDone ? theme.done : "#fff",
                    color: isDone ? "#fff" : "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    
                  }}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <small
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.8rem",
                    color: isDone || isActive ? theme.done : "#666",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {LABEL[step]}
                </small>
              </div>
            );
          })}
        </div>

        {/* === Details Card === */}
        <Card
  style={{
    borderRadius: "16px",
    background: "#ffffff",
    padding: "1.5rem",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderTop: "6px solid #C1CE09",
  }}
>
  <h3
    style={{
      margin: "0 0 0.5rem 0",
      color: "#000",
      fontWeight: "700",
      fontSize: "1.5rem",
    }}
  >
    {LABEL[status]}
  </h3>

  <p style={{ color: "#666", margin: "0 0 1.5rem 0" }}>
    <strong>Last update:</strong> {fmt(data?.updatedAt)}
  </p>

  <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2 }}>
    <li>
      <strong style={{ color: "#86B837" }}>STATUS:</strong> {status}
      
    </li>
    <li>
      <strong style={{ color: "#86B837" }}>CHECK-IN TIME:</strong>{" "}
      {fmt(data?.checkInTime )}
    </li>
    <li>
      <strong style={{ color: "#86B837" }}>DRIVER NAME:</strong>{" "}
      {data?.driverName || "__"}
    </li>
    <li>
      <strong style={{ color: "#86B837" }}>DOCK:</strong>{" "}
      {data?.dock || "TO BE ASSIGNED"}
    </li>
    <li>
      <strong style={{ color: "#86B837" }}>ETA:</strong> {fmt(data?.eta || "TO BE ANNOUNCED")}
    </li>
    <li>
      <strong style={{ color: "#86B837" }}>REMARKS:</strong>{" "}
      {data?.remarks || "—"}
    </li>
  </ul>

  <div
    style={{
      marginTop: "1.5rem",
      padding: "0.75rem 1rem",
      background: "#F7FAE3",
      color: "#000",
      borderRadius: "10px",
      textAlign: "center",
      fontWeight: "600",
      border: "1px solid #C1CE09",
    }}
  >
    CURRENT STEP: <span style={{ color: "#86B837" }}>{LABEL[status]}</span>
  </div>
</Card>

      </Card>
    </section>
  );
}
