import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ViewDetails({ onBack }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all quotations
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:7070/api/quotations/all" // Update with your Java backend URL
      );
      setQuotations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      alert("❌ Error fetching quotations. Make sure Java server is running.");
      setLoading(false);
    }
  };

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
          `http://localhost:7070/api/quotations/${id}` // Update with your Java backend URL
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
                  <div style={styles.detailTitle}>💻 Development Costs</div>
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
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* User Pricing */}
              {selectedQuotation.users && (
                <div style={styles.detailSection}>
                  <div style={styles.detailTitle}>👥 User Pricing</div>
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
                  <div style={styles.detailTitle}>💰 Additional Costs</div>
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
                        )
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

              <div style={{ marginTop: "20px" }}>
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#6366f1",
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
