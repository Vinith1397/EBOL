import { useContext, useState } from "react";
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
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import { ThemeContext } from "../i18n/ThemeProvider";


// your styles must come last
// import "../App.css";

export default function LogInPage() {
    useEffect(() => { setTheme(true); }, [])
    const { theme, setTheme } = useContext(ThemeContext);
    const toast = useRef(null);
    const navigate = useNavigate();
    const { t } = useI18n();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(" ");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    //   useEffect(() => {
    //   const savedAppointment = Cookies.get("driverAppointment");
    //   if (savedAppointment) {
    //     // Redirect immediately to the status page
    //     navigate(`/status/${encodeURIComponent(savedAppointment)}`);
    //   }
    // }, [navigate]);

    const handleCheckIn = async () => {
        const { email, password } = form;
        if (!email || !password) {
            toast.current.show({
                severity: "warn",
                summary: "Missing Fields",
                detail: "Email and Password are required.",
            });
            return;
        }

        setLoading(true);
        setTheme(true);
        navigate(`/admin/dashboard`);
        return;
        console.log("Navigated to Layout");
        //Todo : Remove return stmt , added just for testing
        try {

            //TODO: CHANGE THE API ENDPOINT
            const res = await axios.post(
                "https://mojo-demo-api-dth5ccfccxbbcshb.westus-01.azurewebsites.net/api/Appointment",
                {
                    email: form.email || "",
                    passWord: form.password || "",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            //Todo:   Change according to response structure
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
            //Todo after sucessful response naviagate to admin page
            //Info : uncomment below line
            // navigate(`/admin/dashboard`);


        } catch (err) {
            console.error(err);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Unable to check in. Please try again.",
            });
        } finally {
            //Todo: CHANGE  the correct value from response
            setLoading(false);
            Cookies.set("driverAppointment", appointmentId, { expires: 2 / (60 * 24) });
            navigate(`/status/${encodeURIComponent(appointmentId)}`);
        }
    };

    const clearForm = () => {
        setForm({ email: "", password: "" });
        setStatus("");
    };

    return (
        <div
            className="flex align-items-center justify-content-center p-3"
            style={{
                minHeight: "100vh",
                // backgroundImage: `url('/images/image2.png')`,
                backgroundColor: "rgb(214, 230, 197)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                // backgroundRepeat: "repeat",
                // backgroundSize: "1020px auto",
            }}
        >
            <div className="grid w-full justify-content-center">
                <div className="col-12 sm:col-8 md:col-6 lg:col-4">
                    <Card
                        className="shadow-4"
                        style={{
                            boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
                            borderRadius: "16px",
                            padding: "1rem",
                            background: "white",
                            paddingTop: "0px",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                        }}
                    >
                        <div className="text-center">
                            <h2 style={{ color: "#4a7c59", marginTop: "0px", marginBottom: "0px", fontWeight: "bold" }}>
                                {t("checkin.title")}
                            </h2>
                            <h5 className="text-sm" style={{ color: "#4a7c59" }}>Admin Login</h5>
                        </div>

                        {/* Email */}
                        <div className="field mb-3">
                            <label htmlFor="email" className="block mb-2 font-bold" style={{ color: "#4a7c59" }}>
                                Email:
                            </label>
                            <InputText
                                id="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>

                        {/* Password */}
                        <div className="field mb-3">
                            <label htmlFor="password" className="block mb-2 font-bold" style={{ color: "#4a7c59" }}>
                                Password:
                            </label>
                            <InputText
                                id="password"
                                name="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-column gap-3">
                            <Button
                                label="Log In"
                                style={{
                                    background: "#0a4323",
                                    border: "1px solid #eaf6de",
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                    transition:"background 0.3s"
                                }}
                                loading={loading}
                                onClick={handleCheckIn}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <Toast ref={toast} />
        </div>
        // <div
        //     className="flex align-items-center justify-content-center p-3 pl-2"
        //     style={{
        //         minHeight: "100vh",
        //         padding: "1rem",
        //         background: "#FAF9F6",
        //         backgroundImage: `url('/src/assets/images/image.png')`,

        //     }}
        // >
        // <div className="flex align-items-center justify-content-center w-full">
        //        <Card
        //         className="shadow-4 sm:w-3 md:w-6 lg:w-4 xl:w-13"
        //         style={{
        //             borderRadius: "16px",
        //             padding: "1rem",
        //             background: "white",
        //             // maxWidth: "1280px",
        //             paddingTop: "0px",
        //             paddingLeft: "10px",
        //             paddingRight: "10px",
        //         }}
        //     >
        //         <div className="text-center">
        //             <h2 style={{ color: "#000", marginTop: "0px", marginBottom: "0px", font: "bold", }}>{t("checkin.title")}</h2>
        //             <h5 className="text-sm" style={{ color: "#000" }}>Admin Login</h5>
        //         </div>

        //         {/* Email */}
        //         <div className="field mb-3">
        //             <label htmlFor="email" className="block mb-2 font-bold" style={{ color: "#000" }}>
        //                 Email:
        //             </label>
        //             <InputText
        //                 id="email"
        //                 name="email"
        //                 required
        //                 value={form.email}
        //                 onChange={handleChange}
        //                 className="w-full"
        //             />
        //         </div>
        //         <div className="field mb-3">
        //             <label htmlFor="password" className="block mb-2 font-bold" style={{ color: "#000" }}>
        //                 Password:
        //             </label>
        //             <InputText
        //                 id="password"
        //                 name="password"
        //                 required
        //                 value={form.password}
        //                 onChange={handleChange}
        //                 className="w-full"
        //             />
        //         </div>
        //         {/* Buttons */}
        //         <div className="flex flex-column gap-3">
        //             <Button
        //                 label="Log In"
        //                 //icon="pi"
        //                 //className="p-button-lg"
        //                 style={{
        //                     background: "#000000",
        //                     border: "1px solid #ced4da",
        //                     color: "#FFFFFF",
        //                     fontWeight: "bold",
        //                 }}
        //                 loading={loading}
        //                 onClick={handleCheckIn}
        //             />

        //         </div>
        //     </Card>
        // </div>   

        //     <Toast ref={toast} />
        // </div>
    );
}
