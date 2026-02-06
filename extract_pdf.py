"""
PDF-Extraktor für Versetzungsordnung
"""
import PyPDF2
import sys

def extract_pdf_text(pdf_path):
    """Extrahiert Text aus einer PDF-Datei"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += f"\n--- Seite {page_num + 1} ---\n"
                text += page.extract_text()
            return text
    except Exception as e:
        return f"Fehler beim Lesen der PDF: {e}"

if __name__ == "__main__":
    pdf_path = r"\\sv01\Users$\netzbetreuer\Downloads\Versetzungsordnung_RS_M-Niveau-WEB.pdf"
    text = extract_pdf_text(pdf_path)
    
    # Text in Datei speichern für weitere Analyse
    with open("versetzungsordnung_text.txt", "w", encoding="utf-8") as f:
        f.write(text)
    
    print(text)
