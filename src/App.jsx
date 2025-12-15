import React, { useState } from "react";
import QuotationForm from "./components/QuotationForm";
import QuotationPreview from "./components/QuotationPreview";
import ViewDetails from "./components/ViewDetails";

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

    development: [{ label: "", cost: "", hours: "", rate: "" }],
    users: [{ count: "", price: "" }],
    additionalCosts: [{ label: "", cost: "" }],

    gstPercent: "18",
    paymentTerms: "",
    quotationNumber: "",
  });

  const [currentView, setCurrentView] = useState("form"); // 'form' or 'viewDetails'

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
      width: "480px",
      transform: "scale(0.78)",
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

  const isLargeScreen =
    typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "50px",
          }}
        >
          <h1 style={styles.title}>Quotation Generator</h1>
          <button
            onClick={() => setCurrentView("viewDetails")}
            style={{
              padding: "12px 24px",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#7c3aed")}
            onMouseLeave={(e) => (e.target.style.background = "#8b5cf6")}
          >
            👁️ View Details
          </button>
        </div>

        {currentView === "form" ? (
          <>
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
          </>
        ) : (
          <ViewDetails onBack={() => setCurrentView("form")} />
        )}
      </div>
    </div>
  );
}
