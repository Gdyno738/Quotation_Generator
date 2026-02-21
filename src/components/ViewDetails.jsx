import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

export default function ViewDetails({ onBack }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfToggle, setPdfToggle] = useState({
    userPricing: true,
    additionalCosts: true,
    development: true,
  });

  // Fetch all quotations
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:7070/api/quotations/all", // Update with your Java backend URL
      );
      setQuotations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      alert("❌ Error fetching quotations. Make sure Java server is running.");
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchQuotations();
    })();
  }, []);

  // Fetch single quotation by id and open modal
  const handleViewDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:7070/api/quotations/${id}`);
      setSelectedQuotation(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching quotation details:", error);
      alert("❌ Error fetching quotation details");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        const response = await axios.delete(
          `http://localhost:7070/api/quotations/${id}`, // Update with your Java backend URL
        );
        if (response.status === 200) {
          alert("✅ Quotation deleted successfully!");
          fetchQuotations(); // Refresh the list
        }
      } catch (error) {
        console.error("Error deleting quotation:", error);
        alert("❌ Error deleting quotation");
      }
    }
  };

  // Safe parser: handles JSON string, already-parsed arrays, or null
  const parseField = (field) => {
    if (!field) return [];
    try {
      if (typeof field === "string") return JSON.parse(field);
      if (Array.isArray(field)) return field;
      return [];
    } catch (e) {
      console.error("Failed parsing field:", e);
      return [];
    }
  };

  // Generate PDF with selected sections
  const generatePDF = () => {
    if (!selectedQuotation) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Use toggle states from database or fallback to local state
    const showDevelopment =
      selectedQuotation.showDevelopmentInPDF !== false && pdfToggle.development;
    const showUserPricing =
      selectedQuotation.showUserPricingInPDF !== false && pdfToggle.userPricing;
    const showAdditionalCosts =
      selectedQuotation.showAdditionalCostsInPDF !== false &&
      pdfToggle.additionalCosts;

    let y = 40;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("QUOTATION", pageWidth / 2, 20, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    // Company Details
    pdf.setFont("helvetica", "bold");
    pdf.text("COMPANY DETAILS", 10, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(`Company: ${selectedQuotation.companyName || "-"}`, 10, y);
    y += 6;
    pdf.text(`Address: ${selectedQuotation.companyAddress || "-"}`, 10, y);
    y += 6;
    pdf.text(`Email: ${selectedQuotation.companyEmail || "-"}`, 10, y);
    y += 6;
    pdf.text(`Phone: ${selectedQuotation.companyPhone || "-"}`, 10, y);
    y += 12;

    // Client Details
    pdf.setFont("helvetica", "bold");
    pdf.text("CLIENT DETAILS", 10, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(`Client: ${selectedQuotation.clientName || "-"}`, 10, y);
    y += 6;
    pdf.text(`Email: ${selectedQuotation.clientEmail || "-"}`, 10, y);
    y += 6;
    pdf.text(`Phone: ${selectedQuotation.clientPhone || "-"}`, 10, y);
    y += 6;
    pdf.text(`Project: ${selectedQuotation.projectName || "-"}`, 10, y);
    y += 12;

    // Development Costs
    if (showDevelopment && selectedQuotation.development) {
      const devData = parseField(selectedQuotation.development);
      if (devData.length > 0) {
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text("DEVELOPMENT COSTS", 10, y);
        y += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        devData.forEach((item) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(`${item.label}: INR ${item.cost || 0}`, 15, y);
          y += 6;
        });
        y += 6;
      }
    }

    // User Pricing
    if (showUserPricing && selectedQuotation.users) {
      const usersData = parseField(selectedQuotation.users);
      if (usersData.length > 0) {
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text("USER PRICING", 10, y);
        y += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        usersData.forEach((item) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(`${item.count} Users - INR ${item.price || 0}`, 15, y);
          y += 6;
        });
        y += 6;
      }
    }

    // Additional Costs
    if (showAdditionalCosts && selectedQuotation.additionalCosts) {
      const additionalData = parseField(selectedQuotation.additionalCosts);
      if (additionalData.length > 0) {
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text("ADDITIONAL COSTS", 10, y);
        y += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        additionalData.forEach((item) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(`${item.label}: INR ${item.cost || 0}`, 15, y);
          y += 6;
        });
        y += 6;
      }
    }

    // Financial Summary
    if (y > pageHeight - 50) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("FINANCIAL SUMMARY", 10, y);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      `Subtotal: INR ${(selectedQuotation.subtotal || 0).toFixed(2)}`,
      10,
      y,
    );
    y += 6;
    pdf.text(
      `GST (${selectedQuotation.gstPercent}%): INR ${(selectedQuotation.gstAmount || 0).toFixed(2)}`,
      10,
      y,
    );
    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(
      `Total Amount: INR ${(selectedQuotation.totalAmount || 0).toFixed(2)}`,
      10,
      y,
    );

    pdf.save(`Quotation_${selectedQuotation.clientName}.pdf`);
  };

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      borderBottom: "3px solid #6366f1",
      paddingBottom: "15px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#1f2937",
    },
    backBtn: {
      padding: "10px 20px",
      background: "#6366f1",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    th: {
      background: "#6366f1",
      color: "white",
      padding: "15px",
      textAlign: "left",
      fontWeight: "600",
      fontSize: "14px",
    },
    td: {
      padding: "12px 15px",
      borderBottom: "1px solid #e5e7eb",
    },
    tr: {
      transition: "background 0.2s",
    },
    actionBtn: {
      padding: "8px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      marginRight: "8px",
      fontWeight: "600",
    },
    viewBtn: {
      background: "#10b981",
      color: "white",
    },
    deleteBtn: {
      background: "#ef4444",
      color: "white",
    },
    modal: {
      display: showModal ? "block" : "none",
      position: "fixed",
      zIndex: 1000,
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      background: "white",
      margin: "5% auto",
      padding: "30px",
      borderRadius: "12px",
      maxWidth: "800px",
      maxHeight: "80vh",
      overflowY: "auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },
    modalClose: {
      float: "right",
      fontSize: "28px",
      fontWeight: "bold",
      cursor: "pointer",
      color: "#6366f1",
    },
    detailSection: {
      marginBottom: "20px",
      padding: "15px",
      background: "#f9fafb",
      borderRadius: "8px",
      borderLeft: "4px solid #6366f1",
    },
    detailTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "10px",
    },
    detailText: {
      fontSize: "14px",
      color: "#4b5563",
      marginBottom: "5px",
    },
    table2: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "12px",
      marginTop: "10px",
    },
    th2: {
      background: "#e5e7eb",
      padding: "8px",
      textAlign: "left",
      fontWeight: "600",
    },
    td2: {
      padding: "8px",
      borderBottom: "1px solid #d1d5db",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      fontSize: "18px",
      color: "#6366f1",
    },
    noData: {
      textAlign: "center",
      padding: "40px",
      fontSize: "18px",
      color: "#9ca3af",
    },
    toggleButton: {
      padding: "6px 14px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      marginLeft: "10px",
      transition: "all 0.2s",
    },
    toggleOn: {
      background: "#10b981",
      color: "white",
    },
    toggleOff: {
      background: "#ef4444",
      color: "white",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
    },
  };

  if (loading) {
    return <div style={styles.loading}>⏳ Loading quotations...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 All Quotations</h1>
        <button style={styles.backBtn} onClick={onBack}>
          ← Back to Form
        </button>
      </div>

      {quotations.length === 0 ? (
        <div style={styles.noData}>No quotations found</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Quotation No</th>
              <th style={styles.th}>Client Name</th>
              <th style={styles.th}>Client Email</th>
              <th style={styles.th}>Total Amount</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} style={styles.tr}>
                <td style={styles.td}>{q.id}</td>
                <td style={styles.td}>{q.quotationNumber}</td>
                <td style={styles.td}>{q.clientName}</td>
                <td style={styles.td}>{q.clientEmail}</td>
                <td style={styles.td}>INR {q.totalAmount?.toFixed(2)}</td>
                <td style={styles.td}>{q.quotationDate}</td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.actionBtn, ...styles.viewBtn }}
                    onClick={() => handleViewDetails(q.id)}
                  >
                    👁️ View
                  </button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                    onClick={() => handleDelete(q.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for viewing details */}
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <span style={styles.modalClose} onClick={() => setShowModal(false)}>
            ×
          </span>

          {selectedQuotation && (
            <>
              <h2 style={{ color: "#6366f1", marginBottom: "20px" }}>
                📄 Quotation Details
              </h2>

              {/* Company Details */}
              <div style={styles.detailSection}>
                <div style={styles.detailTitle}>🏢 Company Details</div>
                <div style={styles.detailText}>
                  <strong>Name:</strong> {selectedQuotation.companyName}
                </div>
                <div style={styles.detailText}>
                  <strong>Address:</strong> {selectedQuotation.companyAddress}
                </div>
                <div style={styles.detailText}>
                  <strong>Email:</strong> {selectedQuotation.companyEmail}
                </div>
                <div style={styles.detailText}>
                  <strong>Phone:</strong> {selectedQuotation.companyPhone}
                </div>
              </div>

              {/* Client Details */}
              <div style={styles.detailSection}>
                <div style={styles.detailTitle}>👤 Client Details</div>
                <div style={styles.detailText}>
                  <strong>Name:</strong> {selectedQuotation.clientName}
                </div>
                <div style={styles.detailText}>
                  <strong>Email:</strong> {selectedQuotation.clientEmail}
                </div>
                <div style={styles.detailText}>
                  <strong>Phone:</strong> {selectedQuotation.clientPhone}
                </div>
                <div style={styles.detailText}>
                  <strong>Project:</strong> {selectedQuotation.projectName}
                </div>
              </div>

              {/* Project Information */}
              <div style={styles.detailSection}>
                <div style={styles.detailTitle}>🎯 Project Information</div>
                <div style={styles.detailText}>
                  <strong>Category:</strong> {selectedQuotation.projectCategory}
                </div>
                <div style={styles.detailText}>
                  <strong>Type:</strong> {selectedQuotation.projectType}
                </div>
              </div>

              {/* Development Costs */}
              {selectedQuotation.development && (
                <div style={styles.detailSection}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.detailTitle}>💻 Development Costs</div>
                    <button
                      style={{
                        ...styles.toggleButton,
                        ...(pdfToggle.development
                          ? styles.toggleOn
                          : styles.toggleOff),
                      }}
                      onClick={() =>
                        setPdfToggle((prev) => ({
                          ...prev,
                          development: !prev.development,
                        }))
                      }
                    >
                      {pdfToggle.development ? "✓ ON" : "✗ OFF"}
                    </button>
                  </div>
                  <table style={styles.table2}>
                    <thead>
                      <tr>
                        <th style={styles.th2}>Task</th>
                        <th style={styles.th2}>Cost</th>
                        <th style={styles.th2}>Hours</th>
                        <th style={styles.th2}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseField(selectedQuotation.development).map(
                        (item, idx) => (
                          <tr key={idx}>
                            <td style={styles.td2}>{item.label}</td>
                            <td style={styles.td2}>{item.cost}</td>
                            <td style={styles.td2}>{item.hours}</td>
                            <td style={styles.td2}>{item.rate}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* User Pricing */}
              {selectedQuotation.users && (
                <div style={styles.detailSection}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.detailTitle}>👥 User Pricing</div>
                    <button
                      style={{
                        ...styles.toggleButton,
                        ...(pdfToggle.userPricing
                          ? styles.toggleOn
                          : styles.toggleOff),
                      }}
                      onClick={() =>
                        setPdfToggle((prev) => ({
                          ...prev,
                          userPricing: !prev.userPricing,
                        }))
                      }
                    >
                      {pdfToggle.userPricing ? "✓ ON" : "✗ OFF"}
                    </button>
                  </div>
                  <table style={styles.table2}>
                    <thead>
                      <tr>
                        <th style={styles.th2}>Users</th>
                        <th style={styles.th2}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseField(selectedQuotation.users).map((item, idx) => (
                        <tr key={idx}>
                          <td style={styles.td2}>{item.count}</td>
                          <td style={styles.td2}>{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Additional Costs */}
              {selectedQuotation.additionalCosts && (
                <div style={styles.detailSection}>
                  <div style={styles.sectionHeader}>
                    <div style={styles.detailTitle}>💰 Additional Costs</div>
                    <button
                      style={{
                        ...styles.toggleButton,
                        ...(pdfToggle.additionalCosts
                          ? styles.toggleOn
                          : styles.toggleOff),
                      }}
                      onClick={() =>
                        setPdfToggle((prev) => ({
                          ...prev,
                          additionalCosts: !prev.additionalCosts,
                        }))
                      }
                    >
                      {pdfToggle.additionalCosts ? "✓ ON" : "✗ OFF"}
                    </button>
                  </div>
                  <table style={styles.table2}>
                    <thead>
                      <tr>
                        <th style={styles.th2}>Description</th>
                        <th style={styles.th2}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseField(selectedQuotation.additionalCosts).map(
                        (item, idx) => (
                          <tr key={idx}>
                            <td style={styles.td2}>{item.label}</td>
                            <td style={styles.td2}>{item.cost}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Financial Summary */}
              <div style={styles.detailSection}>
                <div style={styles.detailTitle}>💵 Financial Summary</div>
                <div style={styles.detailText}>
                  <strong>Subtotal:</strong> INR{" "}
                  {selectedQuotation.subtotal?.toFixed(2)}
                </div>
                <div style={styles.detailText}>
                  <strong>GST ({selectedQuotation.gstPercent}%):</strong> INR{" "}
                  {selectedQuotation.gstAmount?.toFixed(2)}
                </div>
                <div
                  style={{
                    ...styles.detailText,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#6366f1",
                  }}
                >
                  <strong>Total Amount:</strong> INR{" "}
                  {selectedQuotation.totalAmount?.toFixed(2)}
                </div>
              </div>

              {/* Payment Terms */}
              <div style={styles.detailSection}>
                <div style={styles.detailTitle}>📝 Payment Terms</div>
                <div style={styles.detailText}>
                  {selectedQuotation.paymentTerms}
                </div>
              </div>

              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#6366f1",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                  onClick={generatePDF}
                >
                  📥 Download PDF
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
