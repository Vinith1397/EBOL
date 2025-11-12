
import React, { useState } from "react";
import { Card, Typography, Select, MenuItem, FormControl } from "@mui/material";
import Grid from "@mui/material/Grid";

const cardStyle = {
  padding: "2rem",
  textAlign: "center",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  borderRadius: "12px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const titleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  marginBottom: "0.75rem",
  color: "#23633f",
};

const countStyle = {
  fontSize: "1.8rem",
  fontWeight: "700",
};

const DashboardSummaryCards = () => {
  const [filterRange, setFilterRange] = useState("Today");

  return (
    <>
    
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0rem", padding: "1rem",
          // backgroundImage: 'url("/images/image.png")',
          backgroundColor: "rgb(214, 230, 197)",
        backgroundRepeat: "repeat",
        backgroundSize: "520px auto",
        backgroundPosition: "top center",
         }}>
          <FormControl size="small">
            <Select
              value={filterRange}
              onChange={(e) => setFilterRange(e.target.value)}
              sx={{ minWidth: "160px", background: "#fff" }}
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Yesterday">Yesterday</MenuItem>
              <MenuItem value="Last Week">Last Week</MenuItem>
              <MenuItem value="Last Month">Last Month</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Grid container spacing={3} style={{ marginBottom: "2rem", padding: "1rem" ,
        backgroundRepeat: "repeat",
        backgroundSize: "520px auto",
        backgroundPosition: "top center",}} className="md:px-4">
          {[
            { title: "Checked In", count: 12 },
            { title: "Packing In Progress", count: 8 },
            { title: "Dock Assigned", count: 25 },
            { title: "Signed BOL", count: 17 },
            { title: "Signed BOL", count: 25 },
            { title: "Checked Out", count: 17 },
          ].map((item, index) => (
            <Grid item size={{xs:12,md:6}} key={index}>
              <Card style={cardStyle}>
                <Typography style={titleStyle}>{item.title}</Typography>
                <Typography style={countStyle}>{item.count}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
    </>
  );
};

export default DashboardSummaryCards;