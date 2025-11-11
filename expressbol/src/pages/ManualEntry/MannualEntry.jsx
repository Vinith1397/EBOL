// import React, { useState, useRef } from "react";
// import axios from "axios";
// import { InputText } from "primereact/inputtext";
// import { Dropdown } from "primereact/dropdown";
// import { InputTextarea } from "primereact/inputtextarea";
// import { Button } from "primereact/button";
// import { Toast } from "primereact/toast";

// export const ManualEntry = () => {
//   const [driverName, setDriverName] = useState("");
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [message, setMessage] = useState("");
//   const [appointmentId, setAppointmentId] = useState("");
//   const [salesOrderId, setSalesOrderId] = useState("");
//   const toast = useRef(null);

//   const handleSubmit = async (e) => {handleSubmit
//     e.preventDefault();

//     const payload = {
//       driverName: driverName || "",
//       phoneNumber: mobileNumber || "",
//       appointmentId: appointmentId || "",
//       salesIds: salesOrderId ? [salesOrderId] : [],
//     };

//     try {
//       const res = await axios.post(
//         "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin",
//         payload
//       );

//       if (res.status === 200 || res.data?.success) {
//         toast.current.show({
//           severity: "success",
//           summary: "Success",
//           detail: "Details submitted successfully!",
//           life: 3000,
//         });
//         handleReset();
//       } else {
//         toast.current.show({
//           severity: "warn",
//           summary: "Failed",
//           detail: "Submission failed. Please try again.",
//           life: 3000,
//         });
//       }
//     } catch (error) {
//       console.error("Error submitting data:", error);
//       toast.current.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Something went wrong. Please check your network or API.",
//         life: 3000,
//       });
//     }
//   };

//   const handleReset = () => {
//     setDriverName("");
//     setMobileNumber("");
//     setMessage("");
//     setAppointmentId("");
//     setSalesOrderId("");
//   };

//   return (
//     <>
//       <Toast ref={toast} />
//       <form onSubmit={handleSubmit} className="p-fluid grid formgrid" >
//         {/* Driver Name */}
//         <div className="field col-12 md:col-6">
//           <label>Driver Name</label>
//           <InputText
//             value={driverName}
//             onChange={(e) => setDriverName(e.target.value)}
//             placeholder="Enter Driver Name"
//           />
//         </div>

//         {/* Mobile Number */}
//         <div className="field col-12 md:col-6">
//           <label>Driver Mobile No</label>
//           <InputText
//             value={mobileNumber}
//             onChange={(e) => setMobileNumber(e.target.value)}
//             placeholder="+1XXXXXXXXXX"
//           />
//         </div>

//         {/* Message (optional / not sent to API) */}
//         <div className="field col-12">
//           <label>Message (Optional)</label>
//           <InputTextarea
//             rows={3}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Enter message"
//           />
//         </div>

//         {/* Appointment ID */}
//         <div className="field col-12 md:col-6">
          
//           <label>Appointment Id</label>
//           <InputText
//             value={appointmentId}
//             onChange={(e) => setAppointmentId(e.target.value)}
//             placeholder="Enter Appointment Id"
//             className="w-full"
//           />
         
//         </div>

//         {/* Sales Order ID */}
//         <div className="field col-12 md:col-6">
//           <label>Sales Order ID</label>
//           <InputText
//             value={salesOrderId}
//             onChange={(e) => setSalesOrderId(e.target.value)}
//             placeholder="Enter Sales Order Id"
//           />
//         </div>

//         {/* Buttons */}
//         <div className="field col-12 flex justify-content-end gap-2 mt-3">
//           <Button
//             type="submit"
//             label="Submit"
//             style={{ background: "#0a4323", borderColor: "#eaf6de" }}
//             icon="pi pi-check"
//             className="p-button-sm p-button-success"
//           />
//           <Button
//             type="button"
//             label="Reset"
//             icon="pi pi-refresh"
//             className="p-button-sm p-button-secondary"
//             onClick={handleReset}
//           />
//         </div>
//       </form>
//     </>
//   );
// };


import React, { useState, useRef } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";

export const ManualEntry = () => {
  const toast = useRef(null);

  // Driver & Basic Info
  const [driverName, setDriverName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [driverLicenseState, setDriverLicenseState] = useState("");
  const [carrierName, setCarrierName] = useState("");

  // Vehicle Info
  const [trailerLP, setTrailerLP] = useState("");
  const [trailerState, setTrailerState] = useState("");
  const [trailerNumber, setTrailerNumber] = useState("");
  const [tractorNumber, setTractorNumber] = useState("");

  // Orders
  const [salesOrderId, setSalesOrderId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  // Trailer Condition
  const [trailerClean, setTrailerClean] = useState(false);
  const [trailerOdorFree, setTrailerOdorFree] = useState(false);
  const [trailerPreCooled, setTrailerPreCooled] = useState(false);
  const [temperature, setTemperature] = useState("");

  // Message
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for required fields
    if (!driverName || !mobileNumber || !carrierName || !salesOrderId) {
      toast.current.show({
        severity: "warn",
        summary: "Missing Fields",
        detail: "Please fill in all required fields before submitting.",
        life: 3000,
      });
      return;
    }

    const payload = {
      driverName,
      phoneNumber: mobileNumber,
      driverLicense,
      driverLicenseState,
      carrierName,
      trailerLP,
      trailerState,
      trailerNumber,
      tractorNumber,
      appointmentId,
      salesIds: salesOrderId ? [salesOrderId] : [],
      purchaseOrderIds: purchaseOrderId ? [purchaseOrderId] : [],
      trailerStatus: {
        trailerClean,
        trailerOdorFree,
        trailerPreCooled,
        temperature,
      },
      message,
    };

    try {
      const res = await axios.post(
        "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Admin",
        payload
      );

      if (res.status === 200 || res.data?.success) {
        toast.current.show({
          severity: "success",
          summary: "Check-In Successful",
          detail: "Driver details submitted and checked-in.",
          life: 3000,
        });
        handleReset();
      } else {
        toast.current.show({
          severity: "warn",
          summary: "Failed",
          detail: res?.data?.message || "Submission failed. Please try again.",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong. Please check your network or API.",
        life: 3000,
      });
    }
  };

  const handleReset = () => {
    setDriverName("");
    setMobileNumber("");
    setDriverLicense("");
    setDriverLicenseState("");
    setCarrierName("");
    setTrailerLP("");
    setTrailerState("");
    setTrailerNumber("");
    setTractorNumber("");
    setAppointmentId("");
    setSalesOrderId("");
    setPurchaseOrderId("");
    setTrailerClean(false);
    setTrailerOdorFree(false);
    setTrailerPreCooled(false);
    setTemperature("");
    setMessage("");
  };

  return (
    <>
      <Toast ref={toast} />
      <form
        onSubmit={handleSubmit}
        className="p-fluid grid formgrid"
       
      >
        <h3 className="col-12 text-center mb-4" style={{ color: "#0a4323" }}>
          Manual Driver Check-In Entry
        </h3>

        {/* Driver Info */}
        <div className="field col-12 md:col-6">
          <label>Driver Name <span style={{ color: "red" }}>*</span></label>
          <InputText
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Enter Driver Name"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label>Driver Mobile No <span style={{ color: "red" }}>*</span></label>
          <InputText
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="+1XXXXXXXXXX"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Driver License</label>
          <InputText
            value={driverLicense}
            onChange={(e) => setDriverLicense(e.target.value)}
            placeholder="Enter Driver License"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label>License State</label>
          <InputText
            value={driverLicenseState}
            onChange={(e) => setDriverLicenseState(e.target.value)}
            placeholder="Enter License State"
          />
        </div>

        {/* Carrier */}
        <div className="field col-12 md:col-6">
          <label>Carrier Name <span style={{ color: "red" }}>*</span></label>
          <InputText
            value={carrierName}
            onChange={(e) => setCarrierName(e.target.value)}
            placeholder="Enter Carrier Name"
          />
        </div>

        {/* Vehicle Info */}
        <div className="field col-12 md:col-6">
          <label>Trailer LP#</label>
          <InputText
            value={trailerLP}
            onChange={(e) => setTrailerLP(e.target.value)}
            placeholder="Enter Trailer LP#"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label>Trailer State</label>
          <InputText
            value={trailerState}
            onChange={(e) => setTrailerState(e.target.value)}
            placeholder="Enter Trailer State"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label>Trailer #</label>
          <InputText
            value={trailerNumber}
            onChange={(e) => setTrailerNumber(e.target.value)}
            placeholder="Enter Trailer #"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label>Tractor #</label>
          <InputText
            value={tractorNumber}
            onChange={(e) => setTractorNumber(e.target.value)}
            placeholder="Enter Tractor #"
          />
        </div>

        {/* Orders */}
        <div className="field col-12 md:col-6">
          <label>Sales Order ID <span style={{ color: "red" }}>*</span></label>
          <InputText
            value={salesOrderId}
            onChange={(e) => setSalesOrderId(e.target.value)}
            placeholder="Enter Sales Order ID"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label>Purchase Order ID</label>
          <InputText
            value={purchaseOrderId}
            onChange={(e) => setPurchaseOrderId(e.target.value)}
            placeholder="Enter Purchase Order ID"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label>Appointment ID</label>
          <InputText
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            placeholder="Enter Appointment ID"
          />
        </div>

        {/* Trailer Condition */}
        <div className="field col-12">
          <label>Trailer Condition</label>
          <div className="flex flex-wrap gap-3 mt-2">
            <Checkbox
              inputId="clean"
              checked={trailerClean}
              onChange={(e) => setTrailerClean(e.checked)}
            />
            <label htmlFor="clean">Trailer is Clean</label>

            <Checkbox
              inputId="odor"
              checked={trailerOdorFree}
              onChange={(e) => setTrailerOdorFree(e.checked)}
            />
            <label htmlFor="odor">Trailer is Free of Odor</label>

            <Checkbox
              inputId="precool"
              checked={trailerPreCooled}
              onChange={(e) => setTrailerPreCooled(e.checked)}
            />
            <label htmlFor="precool">Trailer is Pre-Cooled</label>
          </div>
        </div>

        {/* Temperature */}
        <div className="field col-12 md:col-3">
          <label>Trailer Temp (°F)</label>
          <InputText
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="°F"
          />
        </div>

        {/* Notes */}
        <div className="field col-12">
          <label>Message / Notes (Optional)</label>
          <InputTextarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter additional notes"
          />
        </div>

        {/* Buttons */}
        <div className="field col-12 flex justify-content-end gap-2 mt-3">
          <Button
            type="submit"
            label="Submit"
            style={{ background: "#0a4323", borderColor: "#eaf6de" }}
            icon="pi pi-check"
            className="p-button-sm p-button-success"
          />
          <Button
            type="button"
            label="Reset"
            icon="pi pi-refresh"
            className="p-button-sm p-button-secondary"
            onClick={handleReset}
          />
        </div>
      </form>
    </>
  );
};

