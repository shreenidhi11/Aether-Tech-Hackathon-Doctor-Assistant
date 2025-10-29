import React, { useState } from "react";
import "../components/AudioSummarizer.css";

function AudioSummarizer() {
  const [file, setfile] = useState(null);
  const [summary, setsummary] = useState(null);
  const [error, seterror] = useState(null);
  const [loading, setloading] = useState(false);
  const [showbutton, setshowbutton] = useState(false);
  const [showSubmitButton, setshowSubmitButton] = useState(false);

  // New changes
  const [reviewedEntities, setReviewedEntities] = useState([]);

  // const handleApprove = (ent, index) => {
  //   const updated = [...entities];
  //   // updated[index].approved = true;
  //   setEntities(updated);
  // };

  const handleEdit = (ent, index) => {
    console.log(ent.word);
    const newWord = prompt("Enter corrected term:");
    if (newWord) {
      const updatedEntity = {
        ...ent,
        word: newWord,
        approved: true,
      };
      setReviewedEntities((prev) => [...prev, updatedEntity]);
      const updatedEntities = [...summary.report.Extracted_Entities];
      updatedEntities[index] = {
        ...updatedEntities[index],
        word: newWord,
      };
      const updatedSummary = { ...summary };
      updatedSummary.report.Extracted_Entities = updatedEntities;
      setsummary(updatedSummary);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/generate-correct-details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewedEntities }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get the correct details");
      }
    } catch (err) {
      console.error(err);
      alert("Failure");
    }
  };

  //functions for handling the file changes
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
      setshowSubmitButton(true);
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
        <h1 style={styles.title}>MedAI: Doctor–Patient Audio Summarizer</h1>
        <p style={styles.subTitle}>Upload your audio file (.wav file)</p>

        <input
          type="file"
          accept=".wav,audio/wav"
          onChange={handleFileChange}
        />
        <button
          onClick={handleSummarize}
          disabled={loading}
          style={styles.specialbutton}
        >
          {loading ? "Summarizing..." : "Get Summary"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {summary && (
        <div style={styles.resultsSection}>
          {/* Transcription */}
          <div>
            <h2 style={styles.h2_1}>Conversation Highlights</h2>
            <p style={styles.h2_2}>{summary.transcription}</p>
          </div>

          {/* <div>
            <h2 style={styles.h2}>Assessment</h2>
            <p style={styles.h2}>{summary.report.Assessment}</p>
          </div> */}

          {/* Extracted Entities */}
          <div>
            <h2 style={styles.h2_3}>Insights Extracted by AI</h2>

            <ul
              style={{
                listStyle: "none",
                paddingLeft: "25px",
                paddingRight: "25px",
                margin: 0,
              }}
            >
              {summary.report.Extracted_Entities.map((ent, index) => (
                <li style={styles.li} key={index}>
                  <div style={styles.extractedAudio}>
                    <div>
                      <span>{ent.entity_group}</span>
                      <span>: {ent.word}</span>
                    </div>
                    {/* <span>{ent.entity_group}</span>
                    <span>: {ent.word}</span> */}
                    <button
                      onClick={() => handleEdit(ent, index)}
                      style={{
                        // background: "linear-gradient(135deg, #011209ff, #059669)",
                        background: "#f4f6f9",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        color: "black",
                        width: "60px",
                        maxWidth: "70px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div style={styles.resultsSection2}>
            {showSubmitButton && (
              <button style={styles.button2} onClick={handleSubmit}>
                Submit Details Correction
              </button>
            )}
            {showbutton && (
              <button style={styles.button2} onClick={handleDownload}>
                Download PDF
              </button>
            )}
          </div>
        </div>
      )}
      {/* <div style={styles.resultsSection2}>
        {showSubmitButton && (
          <button style={styles.button} onClick={handleSubmit}>
            Submit Details Correction
          </button>
        )}
        {showbutton && (
          <button style={styles.button} onClick={handleDownload}>
            Download PDF
          </button>
        )}
      </div> */}
    </div>
  );
}

const styles = {
  specialbutton: {
    background: "linear-gradient(135deg, #34d399, #059669)",
    color: "white",
    fontSize: "0.9rem",
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)",
    // borderBottom: "Black",
    borderUp: "Black",
    borderLeft: "Black",
    borderRight: "Black",
  },
  extractedAudio: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "10px",
  },
  page: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  fileinput: {
    padding: "10px",
    border: "2px dashed #aaa",
    borderRadius: "8px",
    backgroundColor: "#f4f4f4ff",
    cursor: "pointer",
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
  center: {
    textAlign: "center",
  },
  subTitle: {
    marginBottom: "10px",
    fontWeight: "400",
  },
  title: {
    fontSize: "26px",
    marginBottom: "8px",
  },

  // subtitle: {
  //   marginTop: "40px",
  //   fontSize: "22px",
  // },
  h2_1: {
    marginTop: "5px",
    marginBottom: "0px",
    fontWeight: "500",
  },
  h2_2: {
    marginTop: "5px",
    marginBottom: "0px",
    fontWeight: "300",
  },
  h2_3: {
    marginTop: "5px",
    marginBottom: "0px",
    fontWeight: "500",
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
  button2: {
    background: "linear-gradient(135deg, #34d399, #059669)",
    color: "white",
    fontSize: "1rem",
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)",
    // width: "100%",
    // maxWidth: "900px",
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

  resultsSection2: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    gap: "10px",
    marginTop: "25px",
    textAlign: "center",
    // background: "white",
    borderRadius: "12px",
    padding: "25px 30px",
    width: "100%",
    maxWidth: "650px",
    margin: "0 auto",
    //boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
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
    marginBottom: "10px",
    marginTop: "10px",
  },
};

export default AudioSummarizer;
