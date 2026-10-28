# app.py = Python ko backend code
# templates/ = Flask le HTML file haru yehi folder ma khojcha (naam exact templates hunu parcha)
# index.html = tapai le bankeko page.

import io
import os
import uuid

from flask import Flask, render_template, request, send_file, jsonify
from pdf2docx import Converter

# ---------- App setup ----------
mero_website = Flask(__name__)

# User le pathayeko file temporary rakhne folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Maximum file size: 20 MB (bytes ma)
mero_website.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024


# ---------- Routes ----------

# Mul page: Hamro PDF ko HTML dekhaucha
@mero_website.route("/")
def home():
    return render_template("index.html")


# 20 MB bhanda thulo file aayo bhane yo chalcha
@mero_website.errorhandler(413)
def file_too_large(e):
    return jsonify({"error": "File is too large. Maximum size is 20 MB."}), 413


# PDF line ra Word ma convert garne route
@mero_website.route("/convert", methods=["POST"])
def convert():
    # 1. Validation: file aayo ki, PDF ho ki
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files allowed"}), 400

    # 2. Unique naam banayera PDF save garne
    unique_id = str(uuid.uuid4())
    pdf_path = os.path.join(UPLOAD_FOLDER, unique_id + ".pdf")
    docx_path = os.path.join(UPLOAD_FOLDER, unique_id + ".docx")
    file.save(pdf_path)

    # 3. Convert garne, ani Word file memory ma line
    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()

        with open(docx_path, "rb") as f:
            data = io.BytesIO(f.read())
    except Exception as e:
        print(e)  # Debug ko lagi terminal ma dekhaucha
        return jsonify({"error": "Conversion failed"}), 500
    finally:
        # Success ya fail, duitai file delete (privacy + safai)
        for path in (pdf_path, docx_path):
            if os.path.exists(path):
                os.remove(path)

    # 4. Word file user lai pathaune (original naam ma .docx)
    original_name = os.path.splitext(file.filename)[0]
    return send_file(
        data,
        as_attachment=True,
        download_name=original_name + ".docx",
    )


# ---------- Server chalaune ----------
if __name__ == "__main__":
    mero_website.run(debug=True)