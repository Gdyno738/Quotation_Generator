import React from "react";
import stampImage from "../assets/stamp.jpg";

export default function QuotationPreview({ form }) {
  const quotationNumber = form.quotationNumber || "Not generated";

  const devTotal = form.development.reduce(
    (sum, row) => sum + Number(row.cost || 0),
    0
  );

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
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        border: "1px solid #ddd",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <h2 style={{ fontWeight: "800", color: "#4f46e5" }}>
        {form.companyName}
      </h2>
      <p>{form.companyAddress}</p>
      <p>Email: {form.companyEmail}</p>
      <p>Phone: {form.companyPhone}</p>

      <h3 style={{ marginTop: 20 }}>Quotation Details</h3>
      <p>Quotation No: {quotationNumber}</p>
      <p>Date: {new Date().toLocaleDateString("en-IN")}</p>

      <h3 style={{ marginTop: 20 }}>Project Details</h3>
      <p><b>Project Category:</b> {form.projectCategory || "-"}</p>
      <p><b>Project Type:</b> {form.projectType || "-"}</p>

      <p style={{ marginTop: "8px" }}>
        <b>Project Overview:</b><br />
        {form.projectOverview || "No project overview provided."}
      </p>

      <h3 style={{ marginTop: 20 }}>Development Costs</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {form.development.map((row, i) => (
            <tr key={i}>
              <td>{row.label}</td>
              <td>{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>User Pricing</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {form.users.map((row, i) => (
            <tr key={i}>
              <td>{row.count} Users</td>
              <td>{row.price} each</td>
              <td>{Number(row.count) * Number(row.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Additional Costs</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {form.additionalCosts.map((row, i) => (
            <tr key={i}>
              <td>{row.label}</td>
              <td>{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total Summary</h3>
      <p>Subtotal: {subtotal}</p>
      <p>GST: {gst}</p>
      <h2>Total: {totalWithGst}</h2>

      <img
        src={stampImage}
        alt="Stamp"
        style={{
          width: "80px",
          position: "absolute",
          bottom: 40,
          right: 20,
        }}
      />

      <p
        style={{
          position: "absolute",
          bottom: 10,
          right: 20,
          fontWeight: "bold",
        }}
      >
        Authorized Signature
      </p>
    </div>
  );
}
