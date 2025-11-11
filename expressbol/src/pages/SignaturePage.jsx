import { useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export default function SignaturePage() {
  const { appId } = useParams();
  const sigRef = useRef(null);
  const toast = useRef(null);
  const navigate = useNavigate();

  const [strokes, setStrokes] = useState([]); // for "Undo"

  const canvasBg = useMemo(() => "#ffffff", []);

  const handleBegin = () => {
    setStrokes((s) => [...s, sigRef.current?.toData()]);
  };

  const clear = () => {
    sigRef.current?.clear();
    setStrokes([]);
  };

  const undo = () => {
    if (!sigRef.current) return;
    const s = [...strokes];
    s.pop();
    sigRef.current.clear();
    s.forEach((d) => sigRef.current.fromData(d));
    setStrokes(s);
  };

  const save = () => {
    if (sigRef.current?.isEmpty()) {
      toast.current.show({ severity: "warn", summary: "Signature required", detail: "Please sign inside the box." });
      return;
    }
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    // TODO: POST dataUrl to backend with appId
    console.log("Submitting for", appId, dataUrl.slice(0, 64) + "...");
    toast.current.show({ severity: "success", summary: "Saved", detail: "Signature captured." });
    // navigate to a confirmation or back home:
    setTimeout(() => navigate("/"), 600);
  };

  return (
    <section className="px-2 pt-2" style={{ minHeight: "calc(100vh - 120px)" }}>
      <Toast ref={toast} />
      <div className="maxw eb-card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Sign Bill of Lading</h2>
          <div className="text-sm">Application ID: <b>{decodeURIComponent(appId || "")}</b></div>
        </div>

        <div className="sig-wrap center-col">
          <SignatureCanvas
            ref={sigRef}
            backgroundColor={canvasBg}
            penColor="#000"
            canvasProps={{ style: { width: "100%", height: "100%" } }}
            onBegin={handleBegin}
          />
        </div>

        <div className="flex gap-2 flex-wrap mt-3">
          <Button label="Save Signature" icon="pi pi-check" className="eb-cta" onClick={save} />
          <Button label="Undo" icon="pi pi-undo" severity="secondary" onClick={undo} />
          <Button label="Clear" icon="pi pi-trash" outlined onClick={clear} />
          <Button label="Back" icon="pi pi-arrow-left" text onClick={() => history.back()} />
        </div>

        <p className="mt-3 text-sm">
          By tapping “Save Signature,” I confirm that I am authorized to sign this Bill of Lading and that this
          e-signature has the same legal effect as a handwritten signature.
        </p>
      </div>
    </section>
  );
}
