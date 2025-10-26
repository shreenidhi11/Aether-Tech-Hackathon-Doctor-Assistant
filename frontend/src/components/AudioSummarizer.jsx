import React, { useState } from "react";

function AudioSummarizer() {
  const [file, setfile] = useState(null);
  const [summary, setsummary] = useState(null);
  const [error, seterror] = useState(null);
  const [loading, setloading] = useState(false);
  const [showbutton, setshowbutton] = useState(false);

  //   functions for handling the file changes
  const handleFileChange = (event) => {
    setfile(event.target.files[0]);
    setsummary("");
    seterror("");
  };

  // functions for handling PDF file download
  const handleDownload = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/download-pdf-report",
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }
      const blob = await response.blob();
      console.log(blob);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Patient_Report.pdf"; // suggested filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Download failed. Please try again.");
    }
  };

  //   we do not pass the file because when we summarize the setfile already points to the file
  const handleSummarize = async () => {
    if (!file) {
      seterror("Please upload a file first!");
      return;
    }

    seterror("");
    setsummary("");
    setloading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/process-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);

      setsummary(data.structured_report || data);
      setshowbutton(true);
    } catch (err) {
      seterror(`Failed to summarize: ${err.message}`);
    } finally {
      setloading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.container,
          transform: summary ? "translateY(-6px)" : "translateY(0)",
          transition: "transform 0.6s ease",
        }}
      >
        <h1 style={styles.title}>Doctor-Patient Audio Summarizer</h1>
        <p>Upload your lease file (.wav file)</p>

        <input
          type="file"
          accept=".wav,audio/wav"
          onChange={handleFileChange}
        />
        <button
          onClick={handleSummarize}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Summarizing..." : "Get Summary"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {summary && (
        <div style={styles.resultsSection}>
          {/* Transcription */}
          <div>
            <h2 style={styles.h2}>Transcription Summary</h2>
            <p style={styles.h2}>{summary.transcription}</p>
          </div>

          {/* <div>
            <h2 style={styles.h2}>Assessment</h2>
            <p style={styles.h2}>{summary.report.Assessment}</p>
          </div> */}

          {/* Extracted Entities */}
          <div>
            <h2 style={styles.h2}>Extracted data from the audio</h2>
            <ul style={{listStyle: "none", padding: 0, margin: 0} }>
              {summary.report.Extracted_Entities.map((ent, index) => (
                <li  key={index}>
                  <span>{ent.entity_group}</span>
                  <span>({ent.word})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {showbutton && <button onClick={handleDownload}>Download PDF</button>}
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  container: {
    background: "white",
    borderRadius: "12px",
    padding: "25px 30px",
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  center:{
    textAlign:"center",
  },
  title: {
    fontSize: "26px",
    marginBottom: "8px",
  },
  subtitle: {
    marginTop: "40px",
    fontSize: "22px",
  },
  h2:{
    marginTop: "0px",
    marginBottom: "0px",
  },
  button: {
    background: "linear-gradient(135deg, #34d399, #059669)",
    color: "white",
    fontSize: "1rem",
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)",
  },
  input: {
    background: "linear-gradient(135deg, #34d399, #059669)",
    color: "white",
    fontSize: "1rem",
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)",
  },

  resultsSection: {
    marginTop: "50px",
    textAlign: "center",

    background: "white",
    borderRadius: "12px",
    padding: "25px 30px",
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 per row
    gap: "20px",
    marginTop: "20px",
    maxWidth: "1000px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px 20px",
    textAlign: "left",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  cardTitle: {
    marginBottom: "10px",
    fontSize: "17px",
    color: "#333",
  },
  cardText: {
    fontSize: "15px",
    color: "#555",
    lineHeight: "1.5",
  },
  li: {
    listStyle: "none",
  },
};

export default AudioSummarizer;
