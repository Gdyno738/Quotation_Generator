import React from "react";
import stampImage from "../assets/stamp.jpg";

export default function QuotationPreview({ form }) {
  const quotationNumber = form.quotationNumber || "Not generated";

  // -------- TOTAL CALCULATIONS --------
  const devTotal = form.development.reduce((sum, row) => {
    const fixed = Number(row.cost || 0);
    const hourly = Number(row.hours || 0) * Number(row.rate || 0);
    return sum + (fixed > 0 ? fixed : hourly);
  }, 0);

  const usersTotal = form.users.reduce(
    (sum, row) => sum + Number(row.count || 0) * Number(row.price || 0),
    0
  );

  const additionalTotal = form.additionalCosts.reduce(
    (sum, row) => sum + Number(row.cost || 0),
    0
  );

  const subtotal = devTotal + usersTotal + additionalTotal;
  const gst = (subtotal * Number(form.gstPercent || 0)) / 100;
  const totalWithGst = subtotal + gst;

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "28px",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        fontFamily: "Inter, sans-serif",
        maxHeight: "90vh",
        overflowY: "auto",
        color: "#111827",
        lineHeight: "1.5",
      }}
    >

      {/* -------- HEADER -------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "12px",
          marginBottom: "18px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 800 }}>
          QUOTATION
        </h2>

        <div style={{ textAlign: "right", fontSize: "14px" }}>
          <p><b>Quotation No:</b> {quotationNumber}</p>
          <p><b>Date:</b> {new Date().toLocaleDateString("en-IN")}</p>
        </div>
      </div>

      {/* -------- COMPANY + CLIENT DETAILS -------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* LEFT → Company */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>
            Company Details
          </h3>
          <p><b>Company:</b> {form.companyName || "-"}</p>
          <p><b>Address:</b> {form.companyAddress || "-"}</p>
          <p><b>Email:</b> {form.companyEmail || "-"}</p>
          <p><b>Phone:</b> {form.companyPhone || "-"}</p>
        </div>

        {/* RIGHT → Client */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>
            Client Details
          </h3>
          <p><b>Client:</b> {form.clientName || "-"}</p>
          <p><b>Email:</b> {form.clientEmail || "-"}</p>
          <p><b>Phone:</b> {form.clientPhone || "-"}</p>
          <p><b>Project:</b> {form.projectName || "-"}</p>
        </div>
      </div>

      <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

      {/* -------- PROJECT DETAILS -------- */}
      <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>
        Project Details
      </h3>
      <p><b>Project Category:</b> {form.projectCategory || "-"}</p>
      <p><b>Project Type:</b> {form.projectType || "-"}</p>

      <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

      {/* -------- DEVELOPMENT COSTS TABLE -------- */}
      <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>
        Development Costs
      </h3>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "#2563eb", color: "#fff" }}>
            <th style={{ padding: "8px", textAlign: "left" }}>Task</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Cost</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Hours</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Rate</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {form.development.map((row, i) => {
            const fixed = Number(row.cost || 0);
            const hourly = Number(row.hours || 0) * Number(row.rate || 0);
            const total = fixed > 0 ? fixed : hourly;

            return (
              <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "8px" }}>{row.label || "-"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{row.cost || "-"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{row.hours || "-"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{row.rate || "-"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* -------- USER PRICING TABLE -------- */}
      <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>
        User Pricing
      </h3>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "#2563eb", color: "#fff" }}>
            <th style={{ padding: "8px", textAlign: "left" }}>Users</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Price</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {form.users.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px" }}>{row.count || "-"}</td>
              <td style={{ padding: "8px", textAlign: "right" }}>{row.price || "-"}</td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                {Number(row.count || 0) * Number(row.price || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* -------- ADDITIONAL COSTS TABLE -------- */}
      <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>
        Additional Costs
      </h3>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "#2563eb", color: "#fff" }}>
            <th style={{ padding: "8px", textAlign: "left" }}>Description</th>
            <th style={{ padding: "8px", textAlign: "right" }}>Cost</th>
          </tr>
        </thead>
        <tbody>
          {form.additionalCosts.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px" }}>{row.label || "-"}</td>
              <td style={{ padding: "8px", textAlign: "right" }}>{row.cost || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* -------- TOTAL SUMMARY -------- */}
      <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>
        Total Summary
      </h3>

      <div style={{ textAlign: "right" }}>
        <p><b>Subtotal:</b> Rs {subtotal}</p>
        <p>
          <b>GST ({form.gstPercent || 0}%):</b> Rs {gst.toFixed(2)}
        </p>
        <h2 style={{ fontWeight: 800, marginTop: "10px" }}>
          Total Amount: Rs {totalWithGst.toFixed(2)}
        </h2>
      </div>

      {/* -------- SIGNATURE -------- */}
      <div style={{ marginTop: "50px", textAlign: "right" }}>
        <img
          src={stampImage}
          alt="Stamp"
          style={{ width: "80px", marginBottom: "8px" }}
        />
        <p style={{ fontWeight: 700 }}>Authorized Signature</p>
      </div>
    </div>
  );
}
