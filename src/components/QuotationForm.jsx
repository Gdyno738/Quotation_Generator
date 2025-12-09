import React, { useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/nebulytix-logo.png";
import stampImage from "../assets/stamp.jpg";
import { Trash2, PlusCircle } from "lucide-react";

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

  // ============================================================
  //                  PDF GENERATION (FULLY FIXED)
  // ============================================================

  const downloadPDF = () => {

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const date = new Date().toLocaleDateString("en-IN");

    const HEADER_BOTTOM_Y = 25;
    const BOTTOM_MARGIN = 20;

    const addPageHeader = () => {
      try { pdf.addImage(logo, "PNG", 10, 5, 45, 18); } catch {}

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("QUOTATION", pageWidth / 2, 14, { align: "center" });

      pdf.setFontSize(11);
      pdf.text(`Quotation No: ${form.quotationNumber}`, pageWidth - 10, 10, { align: "right" });
      pdf.text(`Date: ${date}`, pageWidth - 10, 16, { align: "right" });

      pdf.line(10, HEADER_BOTTOM_Y, pageWidth - 10, HEADER_BOTTOM_Y);
    };

    addPageHeader();
    let y = HEADER_BOTTOM_Y + 10;

    const ensureSpace = (need = 20) => {
      if (y + need > pageHeight - BOTTOM_MARGIN) {
        pdf.addPage();
        addPageHeader();
        y = HEADER_BOTTOM_Y + 10;
      }
    };

    // ============================================================
    //                      COMPANY + CLIENT DETAILS
    // ============================================================

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);

    const LEFT = 10;
    const RIGHT = pageWidth - 100;

    pdf.text("Company Details", LEFT, y);
    pdf.text("Client Details", RIGHT, y);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    y += 6;

    pdf.text(`Company: ${form.companyName || "-"}`, LEFT, y);
    pdf.text(`Client: ${form.clientName || "-"}`, RIGHT, y);

    y += 6;
    pdf.text(`Address: ${form.companyAddress || "-"}`, LEFT, y);
    pdf.text(`Email: ${form.clientEmail || "-"}`, RIGHT, y);

    y += 6;
    pdf.text(`Email: ${form.companyEmail || "-"}`, LEFT, y);
    pdf.text(`Phone: ${form.clientPhone || "-"}`, RIGHT, y);

    y += 6;
    pdf.text(`Phone: ${form.companyPhone || "-"}`, LEFT, y);
    pdf.text(`Project: ${form.projectName || "-"}`, RIGHT, y);

    y += 10;
    pdf.line(10, y, pageWidth - 10, y);
    y += 10;

    // ============================================================
    //                          PROJECT DETAILS
    // ============================================================

    ensureSpace(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Details", 10, y);

    pdf.setFont("helvetica", "normal");
    y += 8;
    pdf.text(`Project Category: ${form.projectCategory || "-"}`, 10, y);

    y += 6;
    pdf.text(`Project Type: ${form.projectType || "-"}`, 10, y);

    y += 12;

    // ============================================================
    //                      DEVELOPMENT TABLE (FIXED)
    // ============================================================

    ensureSpace(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("Development Costs", 10, y);

    autoTable(pdf, {
      startY: y + 4,

      head: [["Task", "Cost", "Hours", "Rate", "Total"]],
      body: form.development.map((row) => {
        const fixed = Number(row.cost || 0);
        const hourly = Number(row.hours || 0) * Number(row.rate || 0);
        const total = fixed > 0 ? fixed : hourly;
        return [
          row.label || "-",
          row.cost || "-",
          row.hours || "-",
          row.rate || "-",
          total || "-"
        ];
      }),

      margin: { left: 10, right: 10 },
      tableWidth: pageWidth - 20,

      columnStyles: {
        0: { halign: "left", cellWidth: 70 },
        1: { halign: "right", cellWidth: 25 },
        2: { halign: "right", cellWidth: 25 },
        3: { halign: "right", cellWidth: 25 },
        4: { halign: "right", cellWidth: 25 },
      },

      headStyles: { fillColor: [0, 102, 170], halign: "center" },
      styles: { fontSize: 10 },

      didDrawPage: (data) => {
        if (data.pageNumber > 1) addPageHeader();
      }
    });

    y = pdf.lastAutoTable.finalY + 12;

    // ============================================================
    //                      USER PRICING TABLE (FIXED)
    // ============================================================

    ensureSpace(25);
    pdf.setFont("helvetica", "bold");
    pdf.text("User Pricing", 10, y);

    autoTable(pdf, {
      startY: y + 4,

      head: [["Users", "Price", "Total"]],
      body: form.users.map((row) => [
        row.count || "-",
        row.price || "-",
        Number(row.count || 0) * Number(row.price || 0) || "-"
      ]),

      margin: { left: 10, right: 10 },
      tableWidth: pageWidth - 20,

      columnStyles: {
        0: { halign: "right", cellWidth: 60 },
        1: { halign: "right", cellWidth: 60 },
        2: { halign: "right", cellWidth: 60 },
      },

      headStyles: { fillColor: [0, 102, 170], halign: "center" },
      styles: { fontSize: 10 },

      didDrawPage: (data) => {
        if (data.pageNumber > 1) addPageHeader();
      }
    });

    y = pdf.lastAutoTable.finalY + 12;

    // ============================================================
    //                  ADDITIONAL COSTS TABLE (FIXED)
    // ============================================================

    ensureSpace(25);
    pdf.setFont("helvetica", "bold");
    pdf.text("Additional Costs", 10, y);

    autoTable(pdf, {
      startY: y + 4,

      head: [["Description", "Cost"]],
      body: form.additionalCosts.map((row) => [
        row.label || "-",
        row.cost || "-",
      ]),

      margin: { left: 10, right: 10 },
      tableWidth: pageWidth - 20,

      columnStyles: {
        0: { halign: "left", cellWidth: 90 },
        1: { halign: "right", cellWidth: 50 },
      },

      headStyles: { fillColor: [0, 102, 170], halign: "center" },
      styles: { fontSize: 10 },

      didDrawPage: (data) => {
        if (data.pageNumber > 1) addPageHeader();
      }
    });

    y = pdf.lastAutoTable.finalY + 20;

    // ============================================================
    //                        TOTALS SECTION
    // ============================================================

    const devTotal = form.development.reduce((s, r) => {
      const fixed = Number(r.cost || 0);
      const hourly = Number(r.hours || 0) * Number(r.rate || 0);
      return s + (fixed > 0 ? fixed : hourly);
    }, 0);

    const usersTotal = form.users.reduce(
      (s, r) => s + Number(r.count || 0) * Number(r.price || 0), 0
    );

    const additionalTotal = form.additionalCosts.reduce(
      (s, r) => s + Number(r.cost || 0), 0
    );

    const grandSubtotal = devTotal + usersTotal + additionalTotal;
    const gst = (grandSubtotal * Number(form.gstPercent || 0)) / 100;
    const totalWithGst = grandSubtotal + gst;

    ensureSpace(25);

    pdf.setFont("helvetica", "bold");
    pdf.text(`Subtotal: Rs ${grandSubtotal}`, pageWidth - 12, y, { align: "right" });

    y += 8;
    pdf.text(`GST (${form.gstPercent || 0}%): Rs ${gst.toFixed(2)}`, pageWidth - 12, y, { align: "right" });

    y += 10;
    const gstLabel = Number(form.gstPercent) > 0 ? " (Including GST)" : " (Excluding GST)";
    pdf.text(`Total Amount: Rs ${totalWithGst.toFixed(2)}${gstLabel}`, pageWidth - 12, y, { align: "right" });

    y += 20;

    // ============================================================
    //              PAYMENT TERMS + SIGNATURE (FIXED)
    // ============================================================

    pdf.setFont("helvetica", "bold");
    pdf.text("Payment Terms:", 10, y);
    y += 6;

    const txt = form.paymentTerms?.trim() || "-";
    const wrapped = pdf.splitTextToSize(txt, pageWidth - 20);

    const need = wrapped.length * 6 + 40;
    const leftSpace = pageHeight - y - BOTTOM_MARGIN;

    if (need > leftSpace) {
      pdf.addPage();
      addPageHeader();
      y = HEADER_BOTTOM_Y + 10;
    }

    pdf.setFont("helvetica", "normal");
    pdf.text(wrapped, 10, y);

    y += wrapped.length * 6 + 4;

    try {
      pdf.addImage(stampImage, "PNG", pageWidth - 40, y, 25, 25);
    } catch {}

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Authorized Signature", pageWidth - 45, y + 32);

    pdf.save(`Quotation_${form.projectName}.pdf`);
  };

  // ============================================================
  //                     UI STYLING (UNCHANGED)
  // ============================================================

  const styles = {
    pageWrapper: {
      padding: "25px 20px",
      maxWidth: "900px",
      margin: "0 auto",
      fontFamily: "Inter, sans-serif",
    },

    section: {
      background: "#ffffff",
      padding: "26px",
      borderRadius: "16px",
      marginBottom: "28px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    },

    sectionTitle: {
      fontSize: "20px",
      fontWeight: 700,
      marginBottom: "18px",
      color: "#1f2937",
      borderLeft: "6px solid #6366f1",
      paddingLeft: "14px",
    },

    label: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151",
      marginBottom: "6px",
      display: "block",
    },

    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: "18px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      background: "#fafafa",
      fontSize: "15px",
    },

    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      background: "#fafafa",
      fontSize: "15px",
      minHeight: "120px",
      marginBottom: "18px",
      resize: "vertical",
    },

    rowGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
      gap: "14px",
      alignItems: "end",
      marginBottom: "16px",
    },

    smallRow: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr auto",
      gap: "14px",
      alignItems: "end",
      marginBottom: "16px",
    },

    deleteBtn: {
      background: "#ef4444",
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    buttonAdd: {
      background: "#4f46e5",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      width: "fit-content",
    },

    submitBtn: {
      width: "100%",
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      color: "#fff",
      padding: "18px",
      borderRadius: "14px",
      border: "none",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: "700",
      marginTop: "30px",
      boxShadow: "0 8px 20px rgba(79,70,229,0.3)",
      transition: "0.2s ease",
    },
  };

  // ============================================================
  //                    FULL UI RETURN (UNCHANGED)
  // ============================================================

  return (
    <div style={styles.pageWrapper}>

      {/* COMPANY DETAILS */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Company Details</h3>

        <label style={styles.label}>Company Name</label>
        <input name="companyName" style={styles.input} onChange={updateField} />

        <label style={styles.label}>Address</label>
        <input name="companyAddress" style={styles.input} onChange={updateField} />

        <label style={styles.label}>Email</label>
        <input name="companyEmail" style={styles.input} onChange={updateField} />

        <label style={styles.label}>Phone</label>
        <input name="companyPhone" style={styles.input} onChange={updateField} />
      </div>

      {/* CLIENT DETAILS */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Client Details</h3>

        <label style={styles.label}>Client Name</label>
        <input name="clientName" style={styles.input} onChange={updateField} />

        <label style={styles.label}>Client Email</label>
        <input name="clientEmail" style={styles.input} onChange={updateField} />

        <label style={styles.label}>Client Phone</label>
        <input name="clientPhone" style={styles.input} onChange={updateField} />

        <label style={styles.label}>Project Name</label>
        <input name="projectName" style={styles.input} onChange={updateField} />
      </div>

      {/* PROJECT INFO */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Project Information</h3>

        <label style={styles.label}>Project Category</label>
        <select name="projectCategory" style={styles.input} onChange={updateField}>
          <option value="">Select Category</option>
          <option value="Mobile Application">Mobile Application</option>
          <option value="E-Commerce Website">E-Commerce Website</option>
          <option value="Business Website">Business Website</option>
          <option value="Portfolio Website">Portfolio Website</option>
          <option value="Custom Software">Custom Software</option>
        </select>

        <label style={styles.label}>Project Type</label>
        <input name="projectType" style={styles.input} onChange={updateField} />
      </div>

      {/* DEVELOPMENT COSTS */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Development Costs</h3>

        {form.development.map((row, i) => (
          <div key={i} style={styles.rowGrid}>

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

            <input
              placeholder="Hours"
              value={row.hours}
              style={styles.input}
              onChange={(e) => updateRow("development", i, "hours", e.target.value)}
            />

            <input
              placeholder="Rate/hr"
              value={row.rate}
              style={styles.input}
              onChange={(e) => updateRow("development", i, "rate", e.target.value)}
            />

            <button style={styles.deleteBtn} onClick={() => deleteRow("development", i)}>
              <Trash2 size={18} color="#fff" />
            </button>

          </div>
        ))}

        <button
          style={styles.buttonAdd}
          onClick={() => addRow("development", { label: "", cost: "" })}
        >
          <PlusCircle size={18} /> Add Development Item
        </button>
      </div>

      {/* USER PRICING */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>User Pricing</h3>

        {form.users.map((row, i) => (
          <div key={i} style={styles.smallRow}>
            <input
              placeholder="No. of Users"
              value={row.count}
              style={styles.input}
              onChange={(e) => updateRow("users", i, "count", e.target.value)}
            />

            <input
              placeholder="Cost/User"
              value={row.price}
              style={styles.input}
              onChange={(e) => updateRow("users", i, "price", e.target.value)}
            />

            <button style={styles.deleteBtn} onClick={() => deleteRow("users", i)}>
              <Trash2 size={18} color="#fff" />
            </button>
          </div>
        ))}

        <button
          style={styles.buttonAdd}
          onClick={() => addRow("users", { count: "", price: "" })}
        >
          <PlusCircle size={18} /> Add User Pricing
        </button>
      </div>

      {/* ADDITIONAL COSTS */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Additional Costs</h3>

        {form.additionalCosts.map((row, i) => (
          <div key={i} style={styles.smallRow}>
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

            <button style={styles.deleteBtn} onClick={() => deleteRow("additionalCosts", i)}>
              <Trash2 size={18} color="#fff" />
            </button>
          </div>
        ))}

        <button
          style={styles.buttonAdd}
          onClick={() => addRow("additionalCosts", { label: "", cost: "" })}
        >
          <PlusCircle size={18} /> Add Additional Cost
        </button>
      </div>

      {/* GST & TERMS */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>GST & Payment Terms</h3>

        <label style={styles.label}>GST Percentage</label>
        <input name="gstPercent" style={styles.input} onChange={updateField} />

        <label style={styles.label}>Payment Terms</label>
        <textarea name="paymentTerms" style={styles.textarea} onChange={updateField}></textarea>
      </div>

      <button
        style={styles.submitBtn}
        onClick={downloadPDF}
      >
        Generate PDF
      </button>

    </div>
  );
}
