import React, { useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
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

  const parseNumber = (val) => {
    if (typeof val === "number") return val;
    if (!val && val !== 0) return 0;
    const s = String(val).replace(/[\,\s\u20B9]/g, "");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
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

  const grandSubtotal = devTotal + usersTotal + additionalTotal;
  const gst = (grandSubtotal * Number(form.gstPercent || 0)) / 100;
  const totalWithGst = grandSubtotal + gst;

  const generateQuotationNumber = () => {
    const now = new Date();
    return `QTN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}${String(now.getDate()).padStart(2, "0")}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
  };

  useEffect(() => {
    if (!form.quotationNumber) {
      setForm((prev) => ({
        ...prev,
        quotationNumber: generateQuotationNumber(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const date = new Date().toLocaleDateString("en-IN");

    // ---------------- HEADER FUNCTION ----------------
    const addPageHeader = () => {
      pdf.addImage(logo, "PNG", 10, 5, 45, 18);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("QUOTATION", pageWidth / 2, 14, { align: "center" });

      pdf.setFontSize(11);
      pdf.text(`Quotation No: ${form.quotationNumber}`, pageWidth - 10, 10, {
        align: "right",
      });
      pdf.text(`Date: ${date}`, pageWidth - 10, 16, { align: "right" });

      pdf.line(10, 25, pageWidth - 10, 25);
    };

    // CALL HEADER FOR FIRST PAGE
    addPageHeader();

    // ---------------- COMPANY + CLIENT DETAILS IN TWO COLUMNS ----------------

    // HEADERS — SAME SIZE + SAME BOLD
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("COMPANY DETAILS", 10, 32);

    pdf.text("CLIENT DETAILS", pageWidth / 2, 32);

    // BODY TEXT — same style for both
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    let leftY = 38;

    // LEFT COLUMN — COMPANY
    pdf.text(`Company : ${form.companyName || "-"}`, 10, leftY);
    pdf.text(`Address : ${form.companyAddress || "-"}`, 10, leftY + 6);
    pdf.text(`Email : ${form.companyEmail || "-"}`, 10, leftY + 12);
    pdf.text(`Phone : ${form.companyPhone || "-"}`, 10, leftY + 18);

    // RIGHT COLUMN — CLIENT
    pdf.text(`Client : ${form.clientName || "-"}`, pageWidth / 2, leftY);
    pdf.text(`Email : ${form.clientEmail || "-"}`, pageWidth / 2, leftY + 6);
    pdf.text(`Phone : ${form.clientPhone || "-"}`, pageWidth / 2, leftY + 12);
    pdf.text(`Project : ${form.projectName || "-"}`, pageWidth / 2, leftY + 18);

    // Separator line
    const detailEndY = leftY + 26;
    pdf.line(10, detailEndY, pageWidth - 10, detailEndY);

    // IMPORTANT: Correct Y start for Project Details
    let y = detailEndY + 10;

    // ---------------- PAGE BREAK HANDLER ----------------
    const ensureSpace = (neededHeight = 20) => {
      if (y + neededHeight > pageHeight - 20) {
        pdf.addPage();
        addPageHeader();
        y = 35; // reset below header
      }
    };

    // ---------------- PROJECT DETAILS ----------------
    ensureSpace(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROJECT DETAILS", 10, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(`Project Category : ${form.projectCategory || "-"}`, 10, y);
    y += 6;
    pdf.text(`Project Type : ${form.projectType || "-"}`, 10, y);
    y += 6;
    y += 6;

    // ---------------- DEVELOPMENT TABLE ----------------
    if (form.showDevelopmentInPDF) {
      ensureSpace(50);
      pdf.setFont("helvetica", "bold");
      pdf.text("DEVELOPMENT COSTS", 10, y);

      const startYDev = y + 8;
      autoTable(pdf, {
        startY: startYDev,
        head: [["TASK", "COST", "HOURS", "RATE", "TOTAL"]],
        body: form.development.map((row) => {
          const fixed = Number(row.cost || 0);
          const hourly = Number(row.hours || 0) * Number(row.rate || 0);
          const total = fixed > 0 ? fixed : hourly;

          return [
            row.label,
            row.cost || "-",
            row.hours || "-",
            row.rate || "-",
            total,
          ];
        }),
        didDrawPage: (data) => {
          addPageHeader();
          // Adjust y if page break occurred
          if (data.pageNumber > 1) {
            y = 40;
          }
        },
      });

      y = pdf.lastAutoTable.finalY + 15;
    }

    // // ---------------- USER PRICING TABLE ----------------
    if (form.showUserPricingInPDF) {
      ensureSpace(50);
      pdf.setFont("helvetica", "bold");
      pdf.text("USER PRICING", 10, y);

      const startYUsers = y + 8;
      autoTable(pdf, {
        startY: startYUsers,
        head: [["USERS", "PRICE", "TOTAL"]],
        body: form.users
          .filter((row) => row.enabled !== false)
          .map((row) => [
            row.count,
            row.price,
            parseNumber(row.count) * parseNumber(row.price),
          ]),
        didDrawPage: (data) => {
          addPageHeader();
          // Adjust y if page break occurred
          if (data.pageNumber > 1) {
            y = 40;
          }
        },
      });

      y = pdf.lastAutoTable.finalY + 15;
    }

    // ---------------- ADDITIONAL COSTS TABLE ----------------
    if (form.showAdditionalCostsInPDF) {
      ensureSpace(50);
      pdf.setFont("helvetica", "bold");
      pdf.text("ADDITIONAL COSTS", 10, y);

      const startYAdditional = y + 8;
      autoTable(pdf, {
        startY: startYAdditional,
        head: [["Description", "Cost"]],
        body: form.additionalCosts
          .filter((row) => row.enabled)
          .map((row) => [row.label, row.cost]),
        didDrawPage: (data) => {
          addPageHeader();
          // Adjust y if page break occurred
          if (data.pageNumber > 1) {
            y = 40;
          }
        },
      });

      y = pdf.lastAutoTable.finalY + 15;
    }

    // ---------------- TOTAL SECTION ----------------
    ensureSpace(40);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);

    pdf.text(`Sub-Total : INR ${grandSubtotal}`, pageWidth - 12, y, {
      align: "right",
    });
    pdf.text(
      `GST (${form.gstPercent || 0}%) : INR ${gst.toFixed(2)}`,
      pageWidth - 12,
      y + 8,
      { align: "right" },
    );

    let gstLabel =
      Number(form.gstPercent) > 0 ? " (Including GST)" : " (Excluding GST)";

    pdf.text(
      `Total Amount : INR ${totalWithGst.toFixed(2)}${gstLabel}`,
      pageWidth - 12,
      y + 17,
      { align: "right" },
    );

    y += 28;

    // ---------------- PAYMENT TERMS (LEFT) + STAMP & SIGNATURE (RIGHT) ----------------
    ensureSpace(30);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    let paymentY = y;

    // LEFT SIDE - PAYMENT TERMS
    pdf.text("PAYMENT TERMS :", 10, paymentY);

    let lines = form.paymentTerms.split("\n");

    lines.forEach((line, index) => {
      pdf.text(line, 10, paymentY + 6 * (index + 1));
    });

    // Calculate position after payment terms
    let termsStartY = paymentY + 6 * (lines.length + 1) + 5;

    // Terms & conditions on left side
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.text("**Terms and conditions apply", 10, termsStartY);

    // RIGHT SIDE - STAMP + SIGNATURE
    const stampSize = 25;
    const stampX = pageWidth - 40;
    const stampY = paymentY;

    try {
      pdf.addImage(stampImage, "PNG", stampX, stampY, stampSize, stampSize);
    } catch {
      console.log("Stamp image not found");
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Authorized Signature", stampX - 10, stampY + stampSize + 8);

    pdf.save(`Quotation_${form.clientName}.pdf`);
  };

  // ---------------------- SAVE TO DATABASE (JAVA BACKEND) ----------------------
  const saveToDatabase = async () => {
    try {
      // Prepare the data to send to Java backend
      const quotationData = {
        quotationNumber: form.quotationNumber,
        quotationDate: new Date().toISOString().split("T")[0],

        // Company Details
        companyName: form.companyName,
        companyAddress: form.companyAddress,
        companyEmail: form.companyEmail,
        companyPhone: form.companyPhone,

        // Client Details
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        projectName: form.projectName,

        // Project Information
        projectCategory: form.projectCategory,
        projectType: form.projectType,

        // Development Costs
        development: form.development,

        // User Pricing
        users: form.users,

        // Additional Costs
        additionalCosts: form.additionalCosts,

        // Financial Details
        gstPercent: Number(form.gstPercent || 0),
        subtotal: grandSubtotal,
        gstAmount: gst,
        totalAmount: totalWithGst,
        paymentTerms: form.paymentTerms,

        // PDF Display Toggles
        showDevelopmentInPDF: form.showDevelopmentInPDF,
        showUserPricingInPDF: form.showUserPricingInPDF,
        showAdditionalCostsInPDF: form.showAdditionalCostsInPDF,

        // Add status
        status: "PENDING",
      };

      // Send POST request to your Java backend
      const response = await axios.post(
        "http://localhost:7070/api/quotations/save", // Update this with your Java backend URL
        quotationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        alert("✅ Quotation saved to database successfully!");
        console.log("Response from backend:", response.data);
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      if (error.response) {
        alert(
          `❌ Error: ${
            error.response.data?.message || "Failed to save quotation"
          }`,
        );
      } else {
        alert(
          "❌ Error connecting to backend. Make sure Java server is running.",
        );
      }
    }
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
    inputInline: {
      flex: 1,
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      marginBottom: 0,
    },
    inputSmall: {
      width: "170px",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      marginBottom: 0,
    },
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      minHeight: "100px",
    },
    row: {
      display: "flex",
      gap: "12px",
      marginBottom: "14px",
      alignItems: "center",
    },
    deleteBtn: {
      background: "#ef4444",
      color: "#fff",
      padding: 0,
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
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
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
    },
    toggleButton: {
      padding: 0,
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "700",
      transition: "all 0.15s",
      width: "72px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    toggleOn: {
      background: "#10b981",
      color: "white",
    },
    toggleOff: {
      background: "#ef4444",
      color: "white",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Company Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Company Details</h3>
        <input
          name="companyName"
          placeholder="Company Name"
          style={styles.input}
          onChange={updateField}
        />
        <input
          name="companyAddress"
          placeholder="Address"
          style={styles.input}
          onChange={updateField}
        />
        <input
          name="companyEmail"
          placeholder="Email"
          style={styles.input}
          onChange={updateField}
        />
        <input
          name="companyPhone"
          placeholder="Phone"
          style={styles.input}
          onChange={updateField}
        />
      </div>

      {/* Client Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Client Details</h3>
        <input
          name="clientName"
          placeholder="Client Name"
          style={styles.input}
          onChange={updateField}
        />
        <input
          name="clientEmail"
          placeholder="Client Email"
          style={styles.input}
          onChange={updateField}
        />
        <input
          name="clientPhone"
          placeholder="Client Phone"
          style={styles.input}
          onChange={updateField}
        />
        <input
          name="projectName"
          placeholder="Project Name"
          style={styles.input}
          onChange={updateField}
        />
      </div>

      {/* Project Info */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Project Information</h3>
        <select
          name="projectCategory"
          style={styles.input}
          onChange={updateField}
        >
          <option value="">Select Category</option>
          <option value="Mobile Application">Mobile Application</option>
          <option value="E-Commerce Website">E-Commerce Website</option>
          <option value="Business Website">Business Website</option>
          <option value="Portfolio Website">Portfolio Website</option>
          <option value="Custom Software">Custom Software</option>
          <option value="Web Application">Web Application</option>
        </select>

        <input
          name="projectType"
          placeholder="Project Type"
          style={styles.input}
          onChange={updateField}
        />
      </div>

      {/* Development Costs */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Development Costs</h3>
          <button
            style={{
              ...styles.toggleButton,
              ...(form.showDevelopmentInPDF
                ? styles.toggleOn
                : styles.toggleOff),
            }}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                showDevelopmentInPDF: !prev.showDevelopmentInPDF,
              }))
            }
          >
            {form.showDevelopmentInPDF ? "✓ ON" : "✗ OFF"}
          </button>
        </div>

        {form.development.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
              gap: "12px",
            }}
          >
            {/* Description */}
            <input
              placeholder="Description"
              value={row.label}
              style={styles.input}
              onChange={(e) =>
                updateRow("development", i, "label", e.target.value)
              }
            />

            {/* Fixed Cost */}
            <input
              placeholder="Cost (optional)"
              value={row.cost}
              style={styles.input}
              type="number"
              onChange={(e) =>
                updateRow("development", i, "cost", e.target.value)
              }
            />

            {/* Hours */}
            <input
              placeholder="Hours"
              value={row.hours}
              style={styles.input}
              type="number"
              onChange={(e) =>
                updateRow("development", i, "hours", e.target.value)
              }
            />

            {/* Rate */}
            <input
              placeholder="Rate/hr"
              value={row.rate}
              style={styles.input}
              type="number"
              onChange={(e) =>
                updateRow("development", i, "rate", e.target.value)
              }
            />

            {/* Delete */}
            <button
              style={styles.deleteBtn}
              onClick={() => deleteRow("development", i)}
            >
              🗑
            </button>
          </div>
        ))}

        <button
          style={styles.buttonAdd}
          onClick={() => addRow("development", { label: "", cost: "" })}
        >
          + Add Development Item
        </button>
      </div>

      {/* User Pricing */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>User Pricing</h3>
          <button
            style={{
              ...styles.toggleButton,
              ...(form.showUserPricingInPDF
                ? styles.toggleOn
                : styles.toggleOff),
            }}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                showUserPricingInPDF: !prev.showUserPricingInPDF,
              }))
            }
          >
            {form.showUserPricingInPDF ? "✓ ON" : "✗ OFF"}
          </button>
        </div>

        {form.users.map((row, i) => (
          <div key={i} style={styles.row}>
            <input
              placeholder="No. of Users"
              value={row.count}
              style={styles.inputInline}
              onChange={(e) => updateRow("users", i, "count", e.target.value)}
            />
            <input
              placeholder="Cost Per User"
              value={row.price}
              style={styles.inputSmall}
              onChange={(e) => updateRow("users", i, "price", e.target.value)}
            />
            <button
              style={{
                ...styles.toggleButton,
                ...(row.enabled ? styles.toggleOn : styles.toggleOff),
              }}
              onClick={() => updateRow("users", i, "enabled", !row.enabled)}
            >
              {row.enabled ? "✓ ON" : "✗ OFF"}
            </button>
            <button
              style={styles.deleteBtn}
              onClick={() => deleteRow("users", i)}
            >
              🗑️
            </button>
          </div>
        ))}

        <button
          style={styles.buttonAdd}
          onClick={() =>
            addRow("users", { count: "", price: "", enabled: true })
          }
        >
          + Add User Pricing
        </button>
      </div>

      {/* Additional Costs */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Additional Costs</h3>
          <button
            style={{
              ...styles.toggleButton,
              ...(form.showAdditionalCostsInPDF
                ? styles.toggleOn
                : styles.toggleOff),
            }}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                showAdditionalCostsInPDF: !prev.showAdditionalCostsInPDF,
              }))
            }
          >
            {form.showAdditionalCostsInPDF ? "✓ ON" : "✗ OFF"}
          </button>
        </div>

        {form.additionalCosts.map((row, i) => (
          <div key={i} style={styles.row}>
            <input
              placeholder="Description"
              value={row.label}
              style={styles.inputInline}
              onChange={(e) =>
                updateRow("additionalCosts", i, "label", e.target.value)
              }
            />
            <input
              placeholder="Cost"
              value={row.cost}
              style={styles.inputSmall}
              onChange={(e) =>
                updateRow("additionalCosts", i, "cost", e.target.value)
              }
            />
            <button
              style={{
                ...styles.toggleButton,
                ...(row.enabled ? styles.toggleOn : styles.toggleOff),
              }}
              onClick={() =>
                updateRow("additionalCosts", i, "enabled", !row.enabled)
              }
            >
              {row.enabled ? "✓ ON" : "✗ OFF"}
            </button>
            <button
              style={styles.deleteBtn}
              onClick={() => deleteRow("additionalCosts", i)}
            >
              🗑️
            </button>
          </div>
        ))}

        <button
          style={styles.buttonAdd}
          onClick={() =>
            addRow("additionalCosts", { label: "", cost: "", enabled: true })
          }
        >
          + Add Additional Cost
        </button>
      </div>

      {/* GST & Terms */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>GST & Payment Terms</h3>
        <input
          name="gstPercent"
          placeholder="GST %"
          style={styles.input}
          onChange={updateField}
        />

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
          marginBottom: "12px",
        }}
        onClick={downloadPDF}
      >
        Generate PDF
      </button>

      <button
        style={{
          width: "100%",
          background: "#10b981",
          color: "white",
          padding: "15px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
        }}
        onClick={saveToDatabase}
      >
        💾 Save to Database
      </button>
    </div>
  );
}
