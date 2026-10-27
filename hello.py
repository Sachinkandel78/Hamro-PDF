# app.py = Python ko backend code
# templates/ = Flask le HTML file haru yehi folder ma khojcha (naam exact templates hunu parcha)
# index.html = tapai le bankeko page. Aaghi ko HTML code yehi file ma copy gara.

import os
import uuid
from flask import Flask, render_template, request, send_file, jsonify
from pdf2docx import Converter

mero_website = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
mero_website.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024


@mero_website.route("/")
def home():
    return render_template("index.html")


@mero_website.route("/convert", methods=["POST"])
def convert():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename:
     return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files allowed"}), 400

    unique_id = str(uuid.uuid4())
    pdf_path = os.path.join(UPLOAD_FOLDER, unique_id + ".pdf")
    docx_path = os.path.join(UPLOAD_FOLDER, unique_id + ".docx")
    file.save(pdf_path)

    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
    except Exception as e:
        print(e)
        return jsonify({"error": "Conversion failed"}), 500
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

    original_name = os.path.splitext(file.filename)[0]
    return send_file(docx_path, as_attachment=True, download_name=original_name + ".docx")


if __name__ == "__main__":
    mero_website.run(debug=True)