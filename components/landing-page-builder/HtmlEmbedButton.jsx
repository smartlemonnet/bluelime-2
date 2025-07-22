// HtmlEmbedButton.jsx
import React, { useState } from "react";

export default function HtmlEmbedButton({ onInsert }) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState("");

  const handleInsert = () => {
    if (html.trim()) {
      onInsert(html);
      setHtml("");
      setOpen(false);
    }
  };

  return (
    <>
      <button
        style={{ fontFamily: "monospace", fontWeight: "bold" }}
        title="Inserisci HTML personalizzato"
        onClick={() => setOpen(true)}
      >
        &#60;/&#62;
      </button>
      {open && (
        <div className="modal-html-embed">
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            placeholder="Incolla qui il tuo snippet HTML (es: tracking, embed, ...)"
            rows={5}
            style={{ width: "100%" }}
          />
          <button onClick={handleInsert}>Inserisci</button>
          <button onClick={() => setOpen(false)}>Annulla</button>
        </div>
      )}
    </>
  );
}