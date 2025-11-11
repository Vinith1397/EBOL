import React, { useState } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "primereact/button";
import styles from "../SideNav/SideNav.module.css"; // Assuming you have CSS modules
const SideNav = ({ isMenuExpanded, toggleMenuMain }) => {
  const [isExpanded, setIsExpanded] = useState(isMenuExpanded);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsExpanded((prev) => !prev);
    toggleMenuMain((prev) => !prev);
  };

  const subMenuPopUp = (id, show) => {
    // Add your hover logic here
    // console.log("Hover on:", id, "Show:", show);
  };

  const createItemTemplate = (item, options) => {
    const isActive = location.pathname === item.path;
    return (
      <div
        className={`${styles.collapsedMenuItems} ${isActive ? styles.active : ""}`}
        onClick={options.onClick}
        onMouseEnter={() => subMenuPopUp(item.id, true)}
      >
        <span className={item.icon} />
        {isExpanded && <span className="ml-2" style={{color:isActive ?"rgb(134, 184, 55)":'#0a4323'}}>{item.label}</span>}
      </div>
    );
  };

  const items = [
    {
      label: "Dash Board",
      icon: "pi pi-fw pi-home",
      path: "/admin/dashboard",
      id: "dashboard",
      command: () => navigate("/admin/dashboard"),
      template: createItemTemplate,
    },
    {
      label: "Appointment",
      icon: "pi pi-fw pi-truck",
      path: "/admin/appointment",
      id: "appointment",
      command: () => navigate("/admin/appointment"),
      template: createItemTemplate,
    },
      {
      label: "Sign BOL",
      icon: "pi pi-pencil",
      path: "/admin/signBol",
      id: "signBol",
      command: () => navigate("/admin/signBol"),
      template: createItemTemplate,
    },
  {
      label: "Manual Entry",
      icon: "pi pi-user-edit",
      path: "/admin/manualEntry",
      id: "manualEntry",
      command: () => navigate("/admin/manualEntry"),
      template: createItemTemplate,
    },
  ];

  return (
    <div
      style={{
        width: isExpanded ? "" : "60px",
        transition: "width 0.3s",
        height: "100%",
        backgroundColor: "#eaf6de",
        borderRight: "1px solid #E0E0E0",
        // display: "flex",
        // flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "space-between" : "center",
          padding: "10px",
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        {isExpanded && <h4 style={{ margin: 0,color:"#0a4323" }}>Admin</h4>}
        <Button
          icon={isExpanded ? "pi pi-angle-left" : "pi pi-angle-right"}
          className={`p-button-rounded p-button-text ${styles.btnFocus}`}
          style={{color:"#0a4323"}}
          onClick={toggleMenu}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <PanelMenu model={items} style={{ border: "none",color:'#000' }} />
      </div>
    </div>
  );
};

export default SideNav;
