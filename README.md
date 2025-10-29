Project Description: The main aim of this project is to help doctors to eliminate their manual documentation work related to doctor patient clinic conversations. This project converts the voice to text, the voice being of the doctor and extracts essential medical entities (symptoms, medications, diagnosis, tests). This formatted report (e.g., SOAP format or FHIR JSON) is stored or exported to EHR/PDF.

Steps to run the project in local environment. After cloning the remote repository setup the backup server first and then the frontend server
1. Backend
    1. Change directory to backend/ 
    2. Run the command pip install -r requirements.txt
    3. Run the command: uvicorn main:app --reload
   
        Note: You should see the URL(for e.g. https://localhost:8000) after running the above command in your IDE terminal   
  2. Frontend
     1. Change directory to frontend/ 
     2. Run the command npm install
     3. Run the command npm run dev
  
        Note: Paste the URL(for e.g. https://localhost:5173) you will get after running the above command on a web browser.

TechStack
  1. Backend: Python, FastAPI
  2. FrontEnd: ReactJS
  3. Machine Learning: Google Gemini SDK & LLM, Hugging Face Medical NER (d4data/biomedical-ner-all), Spacy

Enhancements to add
  1.  Live Audio Streaming between doctors and patients
  2.  Multilingual support (English + Hindi + Spanish)
3. Conversational chatbot interface for quick insights (e.g., “What medications were prescribed?”).
    
