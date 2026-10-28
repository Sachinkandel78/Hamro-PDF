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

  // PDF ho ki check
  if (file.type !== "application/pdf") {
    fileName.textContent = "Please select a PDF file only.";
    convertBtn.classList.add("hidden");
    selectedFile = null;
    return;
  }

  // Size check
  if (file.size > MAX_SIZE) {
    fileName.textContent = "File is too large. Maximum size is 20 MB.";
    convertBtn.classList.add("hidden");
    selectedFile = null;
    return;
  }

  // Sab thik bhayo
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
  if (!selectedFile)