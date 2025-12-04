import React, { useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/nebulytix-logo.png";
import stampImage from "../assets/stamp.jpg";

export default function QuotationForm({ form, setForm }) {
  const updateField = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const updateRow = (section, index, key, value) => {
    const updated = [...form[section]];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, [section]: updated }));
  };

  const addRow = (section, rowObj) => {
    setForm((prev) => ({
      ...prev,
      [section]: [...prev[section], rowObj],
    }));
  };

  const deleteRow = (section, index) => {
    const updated = form[section].filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, [section]: updated }));
  };

  const devTotal = form.development.reduce(
    (sum, row) => sum + Number(row.cost || 0),
    0
  );

  const usersTotal = form.users.reduce(
    (sum, row) => Number(row.count || 0) * Number(row.price || 0) + sum,
    0
  );

  const additionalTotal = form.additionalCosts.reduce(
    (sum, row) => sum + Number(row.cost || 0),
    0
  );

  const grandSubtotal = devTotal + usersTotal + additionalTotal;
  const gst = (grandSubtotal * Number(form.gstPercent || 0)) / 100;
  const totalWithGst = grandSubtotal + gst;

  const generateQuotationNumber = () => {
    const now = new Date();
    return `QTN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  };

  useEffect(() => {
    if (!form.quotationNumber) {
      setForm((prev) => ({
        ...prev,
        quotationNumber: generateQuotationNumber(),
      }));
    }
  }, []);

  // ---------------------- PDF GENERATION ----------------------
 // ---------------------- PDF GENERATION ----------------------
const downloadPDF = () => {
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const date = new Date().toLocaleDateString("en-IN");

  try {
    pdf.addImage(logo, "PNG", 10, 5, 45, 18);
  } catch {}

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("QUOTATION", pageWidth / 2, 18, { align: "center" });

  pdf.setFontSize(11);
  pdf.text(`Quotation No: ${form.quotationNumber}`, pageWidth - 10, 10, { align: "right" });
  pdf.text(`Date: ${date}`, pageWidth - 10, 16, { align: "right" });

  pdf.line(10, 25, pageWidth - 10, 25);

// ---------------- COMPANY + CLIENT DETAILS IN TWO COLUMNS ----------------
pdf.setFont("helvetica", "bold");
pdf.setFontSize(13);
pdf.text("Company Details", 10, 32);

pdf.setFont("helvetica", "normal");
pdf.setFontSize(11);

let leftY = 38;

// LEFT COLUMN — COMPANY
pdf.text(`Company: ${form.companyName || "-"}`, 10, leftY);
pdf.text(`Address: ${form.companyAddress || "-"}`, 10, leftY + 6);
pdf.text(`Email: ${form.companyEmail || "-"}`, 10, leftY + 12);
pdf.text(`Phone: ${form.companyPhone || "-"}`, 10, leftY + 18);

// RIGHT COLUMN — CLIENT
pdf.setFont("helvetica", "bold");
pdf.text("Client Details", pageWidth / 2, 32);

pdf.setFont("helvetica", "normal");
pdf.text(`Client: ${form.clientName || "-"}`, pageWidth / 2, leftY);
pdf.text(`Email: ${form.clientEmail || "-"}`, pageWidth / 2, leftY + 6);
pdf.text(`Phone: ${form.clientPhone || "-"}`, pageWidth / 2, leftY + 12);
pdf.text(`Project: ${form.projectName || "-"}`, pageWidth / 2, leftY + 18);

// Separator line
const detailEndY = leftY + 26;
pdf.line(10, detailEndY, pageWidth - 10, detailEndY);

// IMPORTANT: Correct Y start for Project Details
let y = detailEndY + 10;


    pdf.setFont("helvetica", "bold");
    pdf.text("Project Details", 10, y);

    pdf.setFont("helvetica", "normal");
    y += 8;
    pdf.text(`Project Category: ${form.projectCategory || "-"}`, 10, y);
    y += 6;
    pdf.text(`Project Type: ${form.projectType || "-"}`, 10, y);

    y += 6;
    

    // Development Costs Table
    pdf.text("Development Costs", 10, y + 8);
    autoTable(pdf, {
      startY: y + 12,
      head: [["Task", "Cost (INR)"]],
      body: form.development.map((row) => [row.label, row.cost]),
    });

    // User Pricing Table
    pdf.text("User Pricing", 10, pdf.lastAutoTable.finalY + 8);
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 12,
      head: [["Users", "Price", "Total"]],
      body: form.users.map((row) => [
        row.count,
        row.price,
        Number(row.count) * Number(row.price),
      ]),
    });

    // Additional Costs Table
    pdf.text("Additional Costs", 10, pdf.lastAutoTable.finalY + 8);
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 12,
      head: [["Description", "Cost"]],
      body: form.additionalCosts.map((row) => [row.label, row.cost]),
    });

// ---------------------- TOTAL SECTION ----------------------
let totalY = pdf.lastAutoTable.finalY + 5;

pdf.setFont("helvetica", "bold");
pdf.setFontSize(12);

// Subtotal
pdf.text(`Subtotal: INR ${grandSubtotal}`, pageWidth - 12, totalY, {
  align: "right",
});

// GST Line
pdf.text(
  `GST (${form.gstPercent || 0}%): INR ${gst.toFixed(2)}`,
  pageWidth - 12,
  totalY + 8,
  { align: "right" }
);

// GST label logic
let gstLabel = " (Excluding GST)";
if (form.gstPercent && Number(form.gstPercent) > 0) {
  gstLabel = " (Including GST)";
}

// Total with GST + Label
pdf.text(
  `Total Amount: INR ${totalWithGst.toFixed(2)}${gstLabel}`,
  pageWidth - 12,
  totalY + 17,
  { align: "right" }
);

// ---------------------- PAYMENT TERMS (CLOSER UP) ----------------------
pdf.setFont("helvetica", "normal");
pdf.setFontSize(11);
let paymentY = totalY + 15;
pdf.text(`Payment Terms: ${form.paymentTerms}`, 10, paymentY);

// ---------------------- DYNAMIC STAMP POSITION ----------------------
const stampSize = 25;


// stamp should appear AFTER: totals + payment terms
let stampY = paymentY + 20; // push slightly downward

// If stamp goes off the page bottom, lift it up
if (stampY + stampSize > pageHeight - 20) {
  stampY = pageHeight - stampSize - 20;
}

try {
  pdf.addImage(stampImage, "PNG", pageWidth - 40, stampY, stampSize, stampSize);
} catch {}

// Signature text below stamp
pdf.setFont("helvetica", "bold");
pdf.setFontSize(10);
pdf.text("Authorized Signature", pageWidth - 45, stampY + stampSize + 6);

// ---------------------- TERMS & CONDITIONS (BOTTOM LEFT) ----------------------
pdf.setFont("helvetica", "italic");
pdf.setFontSize(9);

let termsY = pageHeight - 10;

// If stamp is too low, move terms text up safely
if (stampY + stampSize + 10 > termsY) {
  termsY = stampY + stampSize + 15;
}

pdf.text("*Terms and conditions apply", 10, termsY);



    pdf.save(`Quotation_${form.clientName}.pdf`);

    
  };

  // UI Styles (unchanged)
  const styles = {
    pageWrapper: { padding: "10px 0" },
    section: {
      background: "#fff",
      padding: "25px",
      borderRadius: "14px",
      marginBottom: "25px",
      border: "1px solid #e5e7eb",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: "700",
      marginBottom: "15px",
      color: "#1f2937",
      borderLeft: "5px solid #6366f1",
      paddingLeft: "12px",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "14px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      minHeight: "100px",
    },
    row: { display: "flex", gap: "12px", marginBottom: "10px" },
    deleteBtn: {
      background: "#ef4444",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    buttonAdd: {
      background: "#4f46e5",
      color: "white",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Company Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Company Details</h3>
        <input name="companyName" placeholder="Company Name" style={styles.input} onChange={updateField} />
        <input name="companyAddress" placeholder="Address" style={styles.input} onChange={updateField} />
        <input name="companyEmail" placeholder="Email" style={styles.input} onChange={updateField} />
        <input name="companyPhone" placeholder="Phone" style={styles.input} onChange={updateField} />
      </div>

      {/* Client Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Client Details</h3>
        <input name="clientName" placeholder="Client Name" style={styles.input} onChange={updateField} />
        <input name="clientEmail" placeholder="Client Email" style={styles.input} onChange={updateField} />
        <input name="clientPhone" placeholder="Client Phone" style={styles.input} onChange={updateField} />
        <input name="projectName" placeholder="Project Name" style={styles.input} onChange={updateField} />
      </div>

      {/* Project Info */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Project Information</h3>
        <select name="projectCategory" style={styles.input} onChange={updateField}>
          <option value="">Select Category</option>
          <option value="Mobile Application">Mobile Application</option>
          <option value="E-Commerce Website">E-Commerce Website</option>
          <option value="Business Website">Business Website</option>
          <option value="Portfolio Website">Portfolio Website</option>
          <option value="Custom Software">Custom Software</option>
        </select>

        <input name="projectType" placeholder="Project Type" style={styles.input} onChange={updateField} />
      </div>

      {/* Development Costs */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Development Costs</h3>

        {form.development.map((row, i) => (
          <div key={i} style={styles.row}>
            <input
              placeholder="Description"
              value={row.label}
              style={styles.input}
              onChange={(e) => updateRow("development", i, "label", e.target.value)}
            />
            <input
              placeholder="Cost"
              value={row.cost}
              style={styles.input}
              onChange={(e) => updateRow("development", i, "cost", e.target.value)}
            />
            <button style={styles.deleteBtn} onClick={() => deleteRow("development", i)}>🗑️</button>
          </div>
        ))}

        <button style={styles.buttonAdd} onClick={() => addRow("development", { label: "", cost: "" })}>
          + Add Development Item
        </button>
      </div>

      {/* User Pricing */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>User Pricing</h3>

        {form.users.map((row, i) => (
          <div key={i} style={styles.row}>
            <input
              placeholder="No. of Users"
              value={row.count}
              style={styles.input}
              onChange={(e) => updateRow("users", i, "count", e.target.value)}
            />
            <input
              placeholder="Cost Per User"
              value={row.price}
              style={styles.input}
              onChange={(e) => updateRow("users", i, "price", e.target.value)}
            />
            <button style={styles.deleteBtn} onClick={() => deleteRow("users", i)}>🗑️</button>
          </div>
        ))}

        <button style={styles.buttonAdd} onClick={() => addRow("users", { count: "", price: "" })}>
          + Add User Pricing
        </button>
      </div>

      {/* Additional Costs */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Additional Costs</h3>

        {form.additionalCosts.map((row, i) => (
          <div key={i} style={styles.row}>
            <input
              placeholder="Description"
              value={row.label}
              style={styles.input}
              onChange={(e) => updateRow("additionalCosts", i, "label", e.target.value)}
            />
            <input
              placeholder="Cost"
              value={row.cost}
              style={styles.input}
              onChange={(e) => updateRow("additionalCosts", i, "cost", e.target.value)}
            />
            <button style={styles.deleteBtn} onClick={() => deleteRow("additionalCosts", i)}>🗑️</button>
          </div>
        ))}

        <button style={styles.buttonAdd} onClick={() => addRow("additionalCosts", { label: "", cost: "" })}>
          + Add Additional Cost
        </button>
      </div>

      {/* GST & Terms */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>GST & Payment Terms</h3>
        <input name="gstPercent" placeholder="GST %" style={styles.input} onChange={updateField} />
        <textarea
          name="paymentTerms"
          placeholder="Payment Terms"
          style={styles.textarea}
          onChange={updateField}
        ></textarea>
      </div>

      <button
        style={{
          width: "100%",
          background: "#4f46e5",
          color: "white",
          padding: "15px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
        }}
        onClick={downloadPDF}
      >
        Generate PDF
      </button>
    </div>
  );
}
