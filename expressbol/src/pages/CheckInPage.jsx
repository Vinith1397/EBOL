import { use, useContext, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { ThemeContext } from "../i18n/ThemeProvider";

export default function CheckInPage() {
  const {setTheme}= useContext(ThemeContext);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { t } = useI18n();
useEffect(() => {setTheme(false)}, []);
  const [form, setForm] = useState({
    appointmentId: "",
    name: "",
    mobile: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(" ");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  useEffect(() => {
  const savedAppointment = Cookies.get("driverAppointment");
  if (savedAppointment) {
    // Redirect immediately to the status page
    navigate(`/status/${encodeURIComponent(savedAppointment)}`);
  }
}, [navigate]);

  const handleCheckIn = async () => {
    const { appointmentId, name, mobile } = form;
    if (!appointmentId || !name || !mobile) {
      toast.current.show({
        severity: "warn",
        summary: "Missing Fields",
        detail: "Appointment ID, Name and Mobile are required.",
      });
      return;
    }

    setLoading(true);
    setStatus("");

    try {
     
      //await axios.post("https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/Post", form);

          const res = await axios.post(
      "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Appointment",
      {
        appointmentId: form.appointmentId,
        name: form.name,
        mobile: form.mobile,
        email: form.email || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // if ( res.message == "success"){
    //   Cookies.set("driverAppointment", appointmentId, { expires: 10 / 24 }); // 10 hours = 10/24 days
    //   navigate(`/status/${encodeURIComponent(appointmentId)}`);
    //   // 🔹 GET: Check status after submission
    //   // const { data } = await axios.get(
    //   //   `https://your-backend.com/api/checkin/status/${form.appointmentId}`
    //   // );
      

    //   //data?.status
    //   setStatus( true || "Checked In");
    //   toast.current.show({
    //     severity: "success",
    //     summary: "Check-In Successful",
    //     detail: "You are checked in successfully.",
    //   });
    // }
    if (res.data?.message === "Success") {
      Cookies.set("driverAppointment", appointmentId, { expires: 1000 }); // 10 hours
      navigate(`/status/${encodeURIComponent(appointmentId)}`);

      setStatus("Checked In");
      toast.current.show({
        severity: "success",
        summary: "Check-In Successful",
        detail: "You are checked in successfully.",
      });
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Unexpected Response",
        detail: "The server did not confirm success.",
      });
    }

    } catch (err) {
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Unable to check in. Please try again.",
      });
    } finally {
      setLoading(false);
       Cookies.set("driverAppointment", appointmentId, { expires: 2 / (60 * 24) }); 
       navigate(`/status/${encodeURIComponent(appointmentId)}`);
    }
  };

  const clearForm = () => {
    setForm({ appointmentId: "", name: "", mobile: "", email: "" });
    setStatus("");
  };

  return (
    <section
      className="flex align-items-center justify-content-center p-2 pl-2"
      style={{
        minHeight: "100vh",
        background: "#c1ce09ff",
       
        //   "linear-gradient(180deg, #f8f9fa 100%, #ffffff 50%, #D7E83E 0%)"
       //"linear-gradient(180deg, #d1d87fff 0%, #dfec4bff 50%, #E4EF4C 100%)"
      //  "linear-gradient(180deg, #d1d87fff 0%, #dfec4bff 50%, #E4EF4C 100%)"
      // "linear-gradient(180deg, #B9E35A 0%, #9DC63F 50%, #86B837 100%)"

      }}
    >
      <Toast ref={toast} />
      <Card
        //className="shadow-4 w-full sm:w-10 md:w-7 lg:w-5"
         className="shadow-4 w-full sm:w-10 md:w-11 lg:w-13 xl:w-13"
        style={{
          borderRadius: "16px",
          padding: "1rem",
          background: "#f7fae3ff",
          maxWidth: "1280px",
          paddingTop: "0px",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <div className="text-center">
          <h2 style={{ color: "#000", marginTop:"0px" , marginBottom:"0px", font:"bold"}}>{t("checkin.title")}</h2>
          <p className="text-sm">{t("checkin.subtitle")}</p>
        </div>

        {/* Appointment ID */}
        <div className="field mb-3">
          <label htmlFor="appointmentId" className="block mb-2 font-bold" >
            {t("checkin.apptId")}
          </label>
          <InputText
            id="appointmentId"
            name="appointmentId"
            value={form.appointmentId}
            onChange={handleChange}
            placeholder="e.g.,20250101-009tf"
            className="w-full p-inputtext-lg"
          />
        </div>

        {/* Name */}
        <div className="field mb-3">
          <label htmlFor="name" className="block mb-2 font-bold">
            {t("checkin.name")}
          </label>
          <InputText
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className=" w-full p-inputtext-lg"
          />
        </div>

        {/* Mobile */}
        <div className="field mb-3">
          <label htmlFor="mobile" className="block mb-2 font-bold">
           {t("checkin.mobile")}
          </label>
          <InputText
            id="mobile"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="e.g., +1 555-555-5555"
            keyfilter="int"
            inputMode="tel"
            className="w-full p-inputtext-lg"
          />
        </div>

        {/* Email (optional) */}
        {/* <div className="field mb-4">
          <label htmlFor="email" className="block mb-2">
           {t("checkin.email")}
          </label>
          <InputText
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full p-inputtext-lg"
          />
        </div> */}

        {/* Buttons */}
        <div className="flex flex-column gap-3">
          <Button
            label={ t("checkin.checkin") }
            icon="pi"
            className="p-button-lg"
            style={{
              background: "#D7E83E",
              border: "none",
              color: "#000",
              fontWeight: "bold",
            }}
            loading={loading}
            onClick={handleCheckIn}
          />
{/* 
          <Button
            label={ t("checkin.clear") }
            icon="pi pi-times"
            outlined
            className="p-button-lg"
            onClick={clearForm}
          /> */}
        </div>

        {/* {status && (
          <div
            className="text-center mt-4 p-3 border-round"
            style={{
              background: "#F6FFED",
              border: "1px solid #B7EB8F",
              color: "#389E0D",
              fontWeight: 600,
            }}
          >
             Status: {status}
          </div>
        )} */}
      </Card>
    </section>
  );
}
