import os
import json
import io
import tempfile

import spacy
# import medspacy
import google.generativeai as genai
import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
from utils.pdf_generator import *

# Configuration
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
tokenizer = AutoTokenizer.from_pretrained("d4data/biomedical-ner-all")
model = AutoModelForTokenClassification.from_pretrained("d4data/biomedical-ner-all")
nlp = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")
report = ""
filepath= ""

app = FastAPI()
# nlp = spacy.load("en_core_web_sm")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#All utility functions
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
    # doc = nlp(text)
    # entities = []
    # for ent in doc.ents:
    #     entities.append({"text": ent.text, "label": ent.label_})
    #
    #
    # return entities

    entities = nlp(text)
    #processing the entities that have ## tokens mentioned
    #first find the key for which there is ##, then combine all such keys
    diff_entity = ""
    for en_grp in entities:
        if "##" in en_grp['word']:
            diff_entity = en_grp['entity_group']
            en_grp['word'] = en_grp['word'].replace("##", "")

    full_word = ""
    if diff_entity:
        for en_grp in entities:
            if diff_entity == en_grp['entity_group']:
                full_word += en_grp['word']

    new_entities = []
    done = False
    for en_grp in entities:
        if en_grp['entity_group'] == diff_entity:
            if not done:
                done = True
                en_grp['word'] = full_word
                en_grp['score'] = float(en_grp['score'])
                new_entities.append(en_grp)
            else:
                continue
        else:
            en_grp['score'] = float(en_grp['score'])
            new_entities.append(en_grp)

    # print(new_entities)
    return new_entities

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
    global report, filepath
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

    # Generate the pdf
    filepath = generate_pdf("patient_report.pdf", report.get("Subjective"), report.get("Extracted_Entities"))
    os.remove(tmp_path)
    # print({"transcription": text, "report": report})
    return {"transcription": text, "report": report}

@app.get("/download-pdf-report")
async def generate_pdf_report():
    global filepath
    return FileResponse(
        path=filepath,
        filename="Patient_Report.pdf",
        media_type="application/pdf"
    )





if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)






