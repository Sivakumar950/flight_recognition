/**
 * FlightRec — Aircraft Recognition App
 * Pure vanilla JavaScript (no frameworks, no build tools)
 */

(function () {
  'use strict';

  // ─── Config ───
  const CONFIG = window.FLIGHTREC_CONFIG || {};
  const API_URL = CONFIG.API_URL || '/predict';

  // ─── DOM Elements ───
  const dropZone = document.getElementById('drop-zone');
  const dropContent = document.getElementById('drop-content');
  const previewContainer = document.getElementById('preview-container');
  const previewImg = document.getElementById('preview-img');
  const fileInput = document.getElementById('file-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const btnText = document.getElementById('btn-text');
  const resetBtn = document.getElementById('reset-btn');
  const errorCard = document.getElementById('error-card');
  const errorMsg = document.getElementById('error-msg');
  const resultsCard = document.getElementById('results-card');
  const resultAircraft = document.getElementById('result-aircraft');
  const resultAirline = document.getElementById('result-airline');
  const confidenceBar = document.getElementById('confidence-bar');
  const confidenceValue = document.getElementById('confidence-value');
  const historyHint = document.getElementById('history-hint');
  const yearSpan = document.getElementById('year');

  // ─── State ───
  let selectedFile = null;
  let isLoading = false;

  // ─── Init ───
  yearSpan.textContent = new Date().getFullYear();

  // ─── File Handling ───
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('Image must be under 10 MB.');
      return;
    }

    selectedFile = file;
    hideError();
    hideResults();

    const reader = new FileReader();
    reader.onloadend = function () {
      previewImg.src = reader.result;
      dropContent.style.display = 'none';
      previewContainer.style.display = 'block';
      dropZone.classList.add('has-preview');
      analyzeBtn.disabled = false;
      resetBtn.style.display = '';
    };
    reader.readAsDataURL(file);
  }

  // ─── Drag & Drop ───
  dropZone.addEventListener('click', function () {
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files[0]) {
      handleFile(fileInput.files[0]);
    }
  });

  dropZone.addEventListener('dragenter', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-active');
  });

  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-active');
  });

  dropZone.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-active');
  });

  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // ─── Analyze ───
  analyzeBtn.addEventListener('click', function () {
    if (!selectedFile || isLoading) return;
    uploadAndAnalyze();
  });

  async function uploadAndAnalyze() {
    isLoading = true;
    analyzeBtn.disabled = true;
    btnText.innerHTML = '<span class="spinner"></span> Analyzing...';
    analyzeBtn.classList.add('btn-loading');
    hideError();
    hideResults();

    try {
      const base64 = await fileToBase64(selectedFile);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      const data = await response.json();
      showResults(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        showError('Request timed out. Please try again.');
      } else {
        showError(err.message || 'Network error. Check your connection and API URL.');
      }
    } finally {
      isLoading = false;
      analyzeBtn.disabled = false;
      btnText.textContent = 'Analyze Aircraft';
      analyzeBtn.classList.remove('btn-loading');
    }
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onloadend = function () {
        // Remove the data:image/...;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ─── Results Display ───
  function showResults(data) {
    var aircraft = data.aircraft_type || 'Unknown';
    var airline = data.airline || 'Unknown';
    var confidence = parseFloat(data.confidence) || 0;

    resultAircraft.textContent = aircraft;
    resultAirline.textContent = airline;

    // Confidence bar + color
    var color = confidence >= 80 ? '#00e676' : confidence >= 50 ? '#ffab00' : '#ff5252';
    var label = confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low';

    confidenceBar.style.width = confidence + '%';
    confidenceBar.style.background = color;
    confidenceBar.style.boxShadow = '0 0 12px ' + color + '4d';

    confidenceValue.style.color = color;
    confidenceValue.innerHTML = confidence + '%<span class="confidence-tag">' + label + '</span>';

    resultsCard.style.display = '';
    historyHint.style.display = '';
  }

  // ─── Error ───
  function showError(msg) {
    errorMsg.textContent = msg;
    errorCard.style.display = '';
  }

  function hideError() {
    errorCard.style.display = 'none';
  }

  function hideResults() {
    resultsCard.style.display = 'none';
    historyHint.style.display = 'none';
  }

  // ─── Reset ───
  resetBtn.addEventListener('click', function () {
    selectedFile = null;
    fileInput.value = '';
    previewContainer.style.display = 'none';
    dropContent.style.display = '';
    dropZone.classList.remove('has-preview');
    analyzeBtn.disabled = true;
    resetBtn.style.display = 'none';
    hideError();
    hideResults();
  });
})();
