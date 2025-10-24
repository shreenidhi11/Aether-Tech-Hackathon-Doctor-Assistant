import os
import json
import io
import tempfile

import spacy
import google.generativeai as genai
import uvicorn
from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Configuration
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
nlp = spacy.load("en_core_web_sm")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#All functions
def speech_to_text(file):
    '''
    Converts the audio file to text and returns it.
    :param file: audio file
    :return: text
    '''
    uploaded_file = genai.upload_file(file)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content([
        "Transcribe this medical audio into plain text:",
        uploaded_file
    ])
    return response.text


def extract_entities(text):
    '''
    Extracts entities from text.
    :param text: text to extract entities from
    :return: entities
    '''
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append({"text": ent.text, "label": ent.label_})
    return entities

def generate_report(text, entities):
    '''
    Generates report from text.
    :param text: text to generate report from
    :param entities: entities
    :return: JSON formatted report
    '''
    report = {
        "Subjective": text,
        "Extracted_Entities": entities,
        "Assessment": "Pending doctor validation",
        "Plan": "Further evaluation required"
    }
    return report


@app.post("/process-audio")
async def process_audio(file: UploadFile = File(...)):
    # Step 1: Save the uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    #convert the speech to text
    text = speech_to_text(tmp_path)

    #then extract the important words from it
    entities = extract_entities(text)

    # Generate the report
    report = generate_report(text, entities)

    print({"transcription": text, "report": report})
    os.remove(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)






