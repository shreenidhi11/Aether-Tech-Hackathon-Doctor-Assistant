from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def generate_pdf(filename, summary, entities):
    filename = f"medical_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = f"/tmp/{filename}"

    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # Header Section
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 50, "Medical Report Summary")

    # Timestamp Section
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 70, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Summary section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 100, "Summary:")
    c.setFont("Helvetica", 12)
    text = c.beginText(50, height - 120)
    text.setLeading(16)
    max_width = 500
    for line in summary.split("\n"):
        words = line.split()
        wrapped_line = ""
        for word in words:
            test_line = wrapped_line + " " + word if wrapped_line else word
            if c.stringWidth(test_line, "Helvetica", 12) < max_width:
                wrapped_line = test_line
            else:
                text.textLine(wrapped_line)
                wrapped_line = word
        if wrapped_line:
            text.textLine(wrapped_line)

    c.drawText(text)

    # Extracted entities
    c.setFont("Helvetica-Bold", 14)
    y = text.getY() - 30
    c.drawString(50, y, "Extracted Medical Entities:")
    y -= 20
    c.setFont("Helvetica", 12)
    for entity in entities:
        line = f"{entity.get('entity_group')}: {entity.get('word')}"
        c.drawString(60, y, line)
        y -= 20

    c.save()
    return filepath




