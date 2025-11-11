"use client";
import React from "react";
import { useState, useContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import SideNav from "./Container/SideNav/SideNav";
import Navbar from "./Container/NavBar";
import SignaturePage from "./pages/SignaturePage";
import StatusPage from "./pages/StatusPage";
import Grid from "@mui/material/Grid";
import AppointmentTable from "./pages/Appointment/AppointmentTable";
import DashboardSummaryCards from "./pages/DashBoard";
import useMediaQuery from "@mui/material/useMediaQuery";
import MobileNav from "./Container/SideNav/MobileNav";
import PageCardLayout from "./pages/SharedCard/Card";
import SignBol from "./pages/SignBol/SignBol";
import { ManualEntry } from "./pages/ManualEntry/MannualEntry";
import { ThemeContext } from "./i18n/ThemeProvider";
import CheckinStatusTable from "./pages/CheckinStatus/CheckinStatusTable"
import ArchiveBOL from "./pages/ArchiveBOL/ArchiveBoLPage";
const Layout = () => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:770px)");
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const toggleMenu = (toggleFlag) => {
    setIsMenuExpanded(toggleFlag);
  };
  let headingTitle = "";
  const heading = location?.pathname.toLocaleLowerCase();
  if (heading.includes("dashboard")) {
    headingTitle = "Dash Board";
  } else if (heading.includes("appointment")) {
    headingTitle = "Appointment";
  }
  else if (heading.includes("sign")) {
    headingTitle = "Sign BOL";
  }
  else if (heading.includes("manual")) {
    headingTitle = "Manual Entry";
  } else if (heading.includes("logsummary")) {
    headingTitle = "Unkown Page";
  }
  // Map paths to titles
  const pageTitles = {
    "/dashboard": "Signature Page",
    "/def": "Status Page",
    "admin/appointment": "Appointment",
    "/profile": "Profile",
  };

  const pageTitle = pageTitles[location.pathname] || "Dashboard";
  const { setTheme } = useContext(ThemeContext);
  useState(() => { setTheme(true) }, []);
  return (

    <Grid container style={{ height: "100%" }}>
      {/* Sidebar only on desktop */}
      {!isMobile && (
        <Grid size={{ xs: 12, md: isMenuExpanded ? 2 : 1 }} xs={12} md={isMenuExpanded ? 2 : 1}
          sx={!isMenuExpanded && { '@media (min-width:900px)': { width: 'auto !important', flexBasis: 'auto !important' } }}
        >
          <SideNav isMenuExpanded={isMenuExpanded} toggleMenuMain={toggleMenu} />
        </Grid>
      )}

      {/* Main content */}
      <Grid size={{ xs: 12, md: isMobile ? 12 : isMenuExpanded ? 10 : 11 }} xs={{ maxWidth: "unset !important" }} style={{ backgroundColor: "rgb(214, 230, 197)" }}>
        <Navbar pageTitle={headingTitle} />
        <Routes>
          <Route path="/dashboard"
            element={
              <PageCardLayout>
                <DashboardSummaryCards />
              </PageCardLayout>
            }
          />
          <Route path="/appointment"
            element={
              <PageCardLayout>
                <AppointmentTable />
              </PageCardLayout>
            }
          />
          <Route path="/checkinTable"
            element={
              <PageCardLayout>
                <CheckinStatusTable />
              </PageCardLayout>
            }
          />
          <Route path="/signBol"
            element={
              <PageCardLayout>
                <SignBol />
              </PageCardLayout>
            }
          />
          <Route path="/archiveBol"
            element={
              <PageCardLayout>
                <ArchiveBOL />
              </PageCardLayout>
            }
          />
          <Route path="/manualEntry"
            element={
              <PageCardLayout>
                <ManualEntry />
              </PageCardLayout>
            }
          />
          <Route path="*" element={<PageCardLayout><h2>404 Not Found</h2></PageCardLayout>} />
        </Routes>
      </Grid>

      {/* Bottom nav only on mobile */}
      {isMobile &&
        <MobileNav />
      }
    </Grid>
  );
};

export default Layout;
