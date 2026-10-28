// ---------- Elements ----------
const btn = document.getElementById("selectBtn");
const input = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileName = document.getElementById("fileName");
const convertBtn = document.getElementById("convertBtn");
const statusText = document.getElementById("status");
const spinner = document.getElementById("spinner");

// ---------- State ----------
let selectedFile = null;
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

// ---------- File check garne function ----------
function handleFile(file) {
  if (!file) return;

  if (file.type !== "application/pdf") {
    fileName.textContent = "Please select a PDF file only.";
    convertBtn.classList.add("hidden");
    selectedFile = null;
    return;
  }

  if (file.size > MAX_SIZE) {
    fileName.textContent = "File is too large. Maximum size is 20 MB.";
    convertBtn.classList.add("hidden");
    selectedFile = null;
    return;
  }

  selectedFile = file;
  fileName.textContent = "Selected: " + file.name;
  convertBtn.classList.remove("hidden");
  statusText.textContent = "";
}

// ---------- Button thichda file picker kholne ----------
btn.addEventListener("click", () => {
  input.click();
});

// ---------- Picker bata file chhanda ----------
input.addEventListener("change", () => {
  handleFile(input.files[0]);
});

// ---------- Drag and drop ----------
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("bg-red-50");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("bg-red-50");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("bg-red-50");
  handleFile(e.dataTransfer.files[0]);
});

// ---------- Convert button: backend lai pathaune ----------
convertBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const formData = new FormData();
  formData.append("file", selectedFile);

  statusText.textContent = "Converting...";
  convertBtn.disabled = true;
  spinner.classList.remove("hidden");

  try {
    const response = await fetch("/convert", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      statusText.textContent = "Error: " + data.error;
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name.replace(".pdf", ".docx");
    a.click();
    URL.revokeObjectURL(url);

    statusText.textContent = "Done! Your file is downloaded successfully.";
  } catch (err) {
    statusText.textContent = "Something went wrong. Try again.";
  } finally {
    convertBtn.disabled = false;
    spinner.classList.add("hidden");
  }
});