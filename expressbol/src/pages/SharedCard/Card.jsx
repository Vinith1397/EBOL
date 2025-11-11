import React from "react";
import { Card } from "@mui/material";

const PageCardLayout = ({ children }) => {
  return (
    <section
      className="px-3 py-5"
      style={{ backgroundColor: "#d6e6c5" }}
    // style={{ minHeight: "calc(100vh - 120px)", flexShrink: 0 }}
    >
      <Card
        className="px-3 py-2"
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#faffef",
        }}
      >
        {children}
      </Card>
    </section>
  );
};

export default PageCardLayout;