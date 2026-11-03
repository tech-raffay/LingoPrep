"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function RetrySave({ attemptId, onSaved }: { attemptId: string; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function retry() {
    setBusy(true);
    setMessage("");
    try {
      const response = await api.post(`/api/attempts/${attemptId}/save`);
      if (response.data.saved) onSaved();
      else setMessage("Your result could not be saved. Keep this page open and try again.");
    } catch {
      setMessage("Saving is temporarily unavailable. Your feedback is still here.");
    } finally { setBusy(false); }
  }
  return <div>
    <button type="button" disabled={busy} onClick={retry} className="underline disabled:opacity-50">
      {busy ? "Saving…" : "Retry saving result"}
    </button>
    {message && <p role="status">{message}</p>}
  </div>;
}
