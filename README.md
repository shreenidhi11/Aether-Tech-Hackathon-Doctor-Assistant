# Aether-Tech-Hackathon-Doctor-Assistant
Project Description: The main aim of this project is to help doctors to eliminate their manual documentation work related to doctor patient clinic conversations. This project converts the voice to text, the voice being of the doctor and extracts essential medical entities (symptoms, medications, diagnosis, tests). This formatted report (e.g., SOAP format or FHIR JSON) is stored or exported to EHR/PDF.

Steps to run
  1. Backend
     1. Run the command: pip install -r requirements.txt
     2. Run the command: uvicorn main:app --reload
  2. Frontend
     1. Run the command npm install
     2. Run the command: npm run dev
  Note: Paste the URL you will get on running the above command on a web browser

TechStack
  1. Backend: Python, FastAPI
  2. FrontEnd: ReactJS
  3. Machine Learning API: Google Gemini LLM, Hugging Face Medical NER (d4data/biomedical-ner-all)

Enhancements to add
  1.  Live Audio Streaming
  2.  Confidence-based Validation for Doctors
    
