import React, { useState } from "react";
import QuotationForm from "./components/QuotationForm";
import QuotationPreview from "./components/QuotationPreview";

export default function App() {
  const [form, setForm] = useState({
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    projectName: "",
    projectCategory: "",
    projectType: "",
    projectOverview: "",

    development: [{ label: "", cost: "",hours: "",rate: "" }],
    users: [{ count: "", price: "" }],
    additionalCosts: [{ label: "", cost: "" }],

    gstPercent: "",
    paymentTerms: "",
    quotationNumber: "",
  });

  // ------------------ MODERN UI STYLES ------------------
  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "50px 20px",
      display: "flex",
      justifyContent: "center",
    },

    container: {
      width: "100%",
      maxWidth: "1500px",
    },

    title: {
      fontSize: "42px",
      fontWeight: "900",
      color: "#3730a3",
      textAlign: "center",
      marginBottom: "50px",
      letterSpacing: "1px",
    },

    layout: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "40px",
    },

    layoutLarge: {
      display: "grid",
      gridTemplateColumns: "1.5fr 0.9fr",
      gap: "40px",
      alignItems: "flex-start",
    },

    card: {
      background: "#ffffff",
      padding: "35px",
      borderRadius: "18px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
      transition: "0.3s ease",
    },

    formBox: {
      transform: "scale(1.03)",
      transformOrigin: "top left",
    },

    previewWrapper: {
      display: "flex",
      justifyContent: "flex-end",
      width: "100%",
    },

    previewContainer: {
  width: "560px",          // ⬅ increase width
  transform: "scale(0.90)", // ⬅ make preview bigger
  transformOrigin: "top right",
},


    stickyPreview: {
      position: "sticky",
      top: "25px",
      height: "fit-content",
    },

    previewTitle: {
      fontSize: "26px",
      fontWeight: "800",
      color: "#4f46e5",
      textAlign: "center",
      marginBottom: "20px",
    },
  };

  const isLargeScreen = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Quotation Generator</h1>

        {/* Responsive Layout */}
        <div style={isLargeScreen ? styles.layoutLarge : styles.layout}>
          
          {/* LEFT COLUMN — FORM */}
          <div style={{ ...styles.card, ...styles.formBox }}>
            <QuotationForm form={form} setForm={setForm} />
          </div>

          {/* RIGHT COLUMN — PREVIEW */}
          <div style={styles.previewWrapper}>
            <div style={styles.previewContainer}>
              <div style={{ ...styles.card, ...styles.stickyPreview }}>
                <h2 style={styles.previewTitle}>Quotation Preview</h2>
                <QuotationPreview form={form} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
