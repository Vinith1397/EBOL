import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentTab = () => {
    if (location.pathname.includes("dashboard")) return 0;
    if (location.pathname.includes("appointment")) return 1;
    if (location.pathname.includes("sign")) return 2;
    if (location.pathname.includes("manual")) return 4;

    return 0;
  };

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getCurrentTab()}
        onChange={(event, newValue) => {
          if (newValue === 0) navigate("/admin/dashboard");
          else if (newValue === 1) navigate("/admin/appointment");
          // else if (newValue === 2) navigate("/profile");
          else if (newValue === 2) navigate("/admin/signBol");
          else if (newValue === 4) navigate("/admin/manualEntry")


        }}
      >
        <BottomNavigationAction label="Dashboard" icon={<HomeIcon />}
          sx={{
            "&.Mui-selected": {
              color: "#0a4323",
              borderRadius: "8px",
            },
          }}
        />
        <BottomNavigationAction label="Appointment" icon={<LocalShippingIcon />} sx={{
          "&.Mui-selected": {
            color: "#0a4323",
            borderRadius: "8px",
          },
        }} />

        <BottomNavigationAction label="Sign BOL" icon={<EditIcon />} sx={{
          "&.Mui-selected": {
            color: "#0a4323",
            borderRadius: "8px",
          },
        }} /> {/* pi-pencil equivalent */}
        <BottomNavigationAction label="Entry" icon={<AssignmentIcon />} sx={{
          "&.Mui-selected": {
            color: "#0a4323",
            borderRadius: "8px",
          },
        }} />


        {/* <BottomNavigationAction label="Profile" icon={<PersonIcon />} /> */}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNav;