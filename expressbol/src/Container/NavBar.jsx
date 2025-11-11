import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { TieredMenu } from "primereact/tieredmenu";
import { Button } from "primereact/button";
import { useNavigate, useLocation } from "react-router-dom";
const Navbar = ({ pageTitle }) => {
  const menu = useRef(null);
const navigate = useNavigate();
  const items = [
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => {
        console.log("Logout clicked");
      },
    },
  ];

  const handleLogout = () => {
    // Optional: clear auth tokens or session here
    navigate("/admin-login"); // or "/start" if that's your login/home route
  };

  return (
    <div
      style={{
      //  width: "100%",
        height: "60px",
        backgroundColor: "#eaf6de",
        display: "flex",
        fontWeight:"700",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #E0E0E0",
      }}
    >

      {/* Avatar + Menu */}
      {/* <div>
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon={<Avatar image="https://i.pravatar.cc/40" size="large" />}
          className="p-button-text"
          onClick={(e) => menu.current.toggle(e)}
        />
      </div> */}
      {/* Page Title */}
      <h2 style={{  fontSize: "22px", fontWeight: 700,color:'#0a4323' }}>
        {pageTitle || "Dash board"}
      </h2>
      
  <Button
        label="Logout"
        icon="pi pi-sign-out"
        className="p-button-danger p-button-text"
        onClick={handleLogout}
      />

    </div>
  );
};

export default Navbar;
