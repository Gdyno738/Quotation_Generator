import React from "react";
import stampImage from "../assets/stamp.jpg";

export default function QuotationPreview({ form }) {
  const quotationNumber = form.quotationNumber || "Not generated";

  const parseNumber = (val) => {
    if (typeof val === "number") return val;
    if (!val && val !== 0) return 0;
    const s = String(val).replace(/[\,\s\u20B9]/g, "");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  };

  const devTotal = form.development.reduce((sum, row) => {
    // Skip if row has no label/description
    if (!row.label || row.label.trim() === "") return sum;
    const fixed = parseNumber(row.cost);
    const hourly = parseNumber(row.hours) * parseNumber(row.rate);
    // Skip if both cost and hourly are 0
    if (fixed === 0 && hourly === 0) return sum;
    const total = fixed > 0 ? fixed : hourly;
    return sum + total;
  }, 0);

  const usersTotal = form.users.reduce((sum, row) => {
    // Skip if not enabled
    if (row.enabled === false) return sum;
    const count = parseNumber(row.count);
    const price = parseNumber(row.price);
    // Skip if count or price is 0
    if (count === 0 || price === 0) return sum;
    return sum + count * price;
  }, 0);

  const additionalTotal = form.additionalCosts.reduce((sum, row) => {
    // Skip if not enabled
    if (!row.enabled) return sum;
    // Skip if row has no label/description
    if (!row.label || row.label.trim() === "") return sum;
    const cost = parseNumber(row.cost);
    // Skip if cost is 0
    if (cost === 0) return sum;
    return sum + cost;
  }, 0);

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
      <p>
        <b>Project Category:</b> {form.projectCategory || "-"}
      </p>
      <p>
        <b>Project Type:</b> {form.projectType || "-"}
      </p>

      <p style={{ marginTop: "8px" }}>
        <b>Project Overview:</b>
        <br />
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
          {form.users
            .filter((row) => row.enabled !== false)
            .map((row, i) => (
              <tr key={i}>
                <td>{row.count} Users</td>
                <td>{row.price} each</td>
                <td>{parseNumber(row.count) * parseNumber(row.price)}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <h3>Additional Costs</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {form.additionalCosts
            .filter((row) => row.enabled)
            .map((row, i) => (
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
