/**
 * CalcFlow - JavaScript Operator & Calculator Suite
 * Modern, Elegant & High Precision Logic
 */

console.log('CalcFlow Engine Initialized');

// State Management
let currentOperator = '+';
let calculationHistory = [];
const STORAGE_KEY = 'calcflow_history_v1';
const THEME_KEY = 'calcflow_theme_preference';

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadHistory();
    setupEventListeners();
    setupKeypad();
});

/**
 * Core function required by original assignment
 * Preserves signature hitung(operator) and output to #hasil
 */
function hitung(operator) {
    currentOperator = operator;
    updateActiveOperatorUI(operator);

    const input1 = document.getElementById('angka1');
    const input2 = document.getElementById('angka2');
    const hasilElement = document.getElementById('hasil');
    const exprPreview = document.getElementById('exprPreview');
    const resultBox = document.getElementById('resultBox');

    // Validation for empty inputs
    if (input1.value.trim() === '' || input2.value.trim() === '') {
        hasilElement.className = 'result-error';
        hasilElement.innerHTML = '⚠️ Masukkan kedua angka terlebih dahulu';
        if (exprPreview) exprPreview.textContent = '--';
        return 'Harap masukkan kedua angka';
    }

    const angka1 = Number(input1.value);
    const angka2 = Number(input2.value);

    if (isNaN(angka1) || isNaN(angka2)) {
        hasilElement.className = 'result-error';
        hasilElement.innerHTML = '⚠️ Nilai input harus berupa angka valid';
        return 'Input bukan angka';
    }

    let hasil = 0;
    let symbolDisplay = operator;

    switch (operator) {
        case '+':
            hasil = angka1 + angka2;
            symbolDisplay = '+';
            break;
        case '-':
            hasil = angka1 - angka2;
            symbolDisplay = '−';
            break;
        case '*':
            hasil = angka1 * angka2;
            symbolDisplay = '×';
            break;
        case '/':
            if (angka2 === 0) {
                hasilElement.className = 'result-error';
                hasilElement.innerHTML = '⚠️ Tak terdefinisi (Pembagian dengan 0)';
                if (exprPreview) exprPreview.textContent = `${angka1} ÷ 0 = Error`;
                return 'Pembagian dengan nol';
            }
            hasil = angka1 / angka2;
            symbolDisplay = '÷';
            break;
        case '%':
            if (angka2 === 0) {
                hasilElement.className = 'result-error';
                hasilElement.innerHTML = '⚠️ Tak terdefinisi (Modulo dengan 0)';
                return 'Modulo nol';
            }
            hasil = angka1 % angka2;
            symbolDisplay = '%';
            break;
        case '^':
            hasil = Math.pow(angka1, angka2);
            symbolDisplay = '^';
            break;
        default:
            hasil = angka1 + angka2;
            symbolDisplay = '+';
    }

    // Format numbers nicely (up to 8 decimal places if float)
    const formattedHasil = Number.isInteger(hasil) 
        ? hasil.toLocaleString('id-ID') 
        : parseFloat(hasil.toFixed(6)).toLocaleString('id-ID');

    // Update Result Display (#hasil is original ID)
    hasilElement.className = '';
    hasilElement.innerHTML = `Hasilnya adalah: <strong>${formattedHasil}</strong>`;

    if (exprPreview) {
        exprPreview.textContent = `${angka1.toLocaleString('id-ID')} ${symbolDisplay} ${angka2.toLocaleString('id-ID')} =`;
    }

    if (resultBox) {
        resultBox.classList.add('has-result');
    }

    // Save to History
    addHistoryItem({
        num1: angka1,
        num2: angka2,
        op: symbolDisplay,
        rawResult: hasil,
        formattedResult: formattedHasil,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    return `Hasilnya adalah: ${formattedHasil}`;
}

/**
 * Update UI for the clicked operator button
 */
function updateActiveOperatorUI(op) {
    document.querySelectorAll('.op-btn').forEach(btn => {
        if (btn.getAttribute('data-op') === op) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Swap values between angka1 and angka2
 */
function swapInputs() {
    const input1 = document.getElementById('angka1');
    const input2 = document.getElementById('angka2');
    const temp = input1.value;
    input1.value = input2.value;
    input2.value = temp;
    
    if (input1.value !== '' && input2.value !== '') {
        hitung(currentOperator);
    }
}

/**
 * Clear both inputs and reset result
 */
function resetCalculator() {
    document.getElementById('angka1').value = '';
    document.getElementById('angka2').value = '';
    const hasil = document.getElementById('hasil');
    hasil.className = 'empty-state';
    hasil.textContent = 'Menunggu input angka & operator...';
    
    const exprPreview = document.getElementById('exprPreview');
    if (exprPreview) exprPreview.textContent = '--';

    const resultBox = document.getElementById('resultBox');
    if (resultBox) resultBox.classList.remove('has-result');

    document.querySelectorAll('.op-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('angka1').focus();
}

/**
 * Insert preset values
 */
function setPreset(a, b, op) {
    document.getElementById('angka1').value = a;
    document.getElementById('angka2').value = b;
    hitung(op || '+');
}

/**
 * Copy result to clipboard
 */
function copyResult() {
    const hasilElement = document.getElementById('hasil');
    const textToCopy = hasilElement.textContent.replace('Hasilnya adalah: ', '').trim();

    if (!textToCopy || hasilElement.classList.contains('empty-state') || hasilElement.classList.contains('result-error')) {
        return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('toastNotice');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    }).catch(err => {
        console.error('Gagal menyalin:', err);
    });
}

/**
 * Calculation History Management
 */
function addHistoryItem(item) {
    calculationHistory.unshift(item);
    if (calculationHistory.length > 20) {
        calculationHistory.pop();
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calculationHistory));
    } catch (e) {
        console.warn('Storage unavailable', e);
    }
    renderHistory();
}

function loadHistory() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            calculationHistory = JSON.parse(saved);
        }
    } catch (e) {
        calculationHistory = [];
    }
    renderHistory();
}

function clearHistory() {
    calculationHistory = [];
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;

    if (calculationHistory.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <div class="history-empty-icon">🕒</div>
                <p>Belum ada riwayat perhitungan</p>
                <small style="opacity:0.7">Hitung operasi untuk mencatat log otomatis</small>
            </div>
        `;
        return;
    }

    container.innerHTML = calculationHistory.map((item, index) => `
        <div class="history-item" onclick="loadFromHistory(${index})" title="Klik untuk memuat angka ini kembali">
            <div class="history-calc">
                <span class="history-expr">${item.num1} ${item.op} ${item.num2} =</span>
                <span class="history-val">${item.formattedResult}</span>
            </div>
            <span class="history-badge">${item.timestamp}</span>
        </div>
    `).join('');
}

function loadFromHistory(index) {
    const item = calculationHistory[index];
    if (!item) return;

    document.getElementById('angka1').value = item.num1;
    document.getElementById('angka2').value = item.num2;
    
    // Switch to tab 1 if not already
    switchTab('operator');

    let opCode = '+';
    if (item.op === '−' || item.op === '-') opCode = '-';
    else if (item.op === '×' || item.op === '*') opCode = '*';
    else if (item.op === '÷' || item.op === '/') opCode = '/';
    else if (item.op === '%') opCode = '%';
    else if (item.op === '^') opCode = '^';

    hitung(opCode);
}

/**
 * Tab Switcher (Operator Mode vs Keypad Mode)
 */
function switchTab(tabId) {
    const opMode = document.getElementById('operatorModeContent');
    const kpMode = document.getElementById('keypadModeContent');
    const tabOp = document.getElementById('tabOperator');
    const tabKp = document.getElementById('tabKeypad');

    if (tabId === 'operator') {
        opMode.style.display = 'block';
        kpMode.classList.remove('active');
        tabOp.classList.add('active');
        tabKp.classList.remove('active');
    } else {
        opMode.style.display = 'none';
        kpMode.classList.add('active');
        tabOp.classList.remove('active');
        tabKp.classList.add('active');
    }
}

/**
 * Full Keypad Logic (Mode 2)
 */
let keypadExpression = '';
function setupKeypad() {
    const screen = document.getElementById('keypadDisplay');
    const historyScreen = document.getElementById('keypadExprDisplay');

    window.keypadInput = function(val) {
        if (keypadExpression === '0' && !isNaN(val)) {
            keypadExpression = val;
        } else {
            keypadExpression += val;
        }
        updateKeypadUI();
    };

    window.keypadClear = function() {
        keypadExpression = '';
        if (historyScreen) historyScreen.textContent = '';
        if (screen) screen.textContent = '0';
    };

    window.keypadBackspace = function() {
        keypadExpression = keypadExpression.slice(0, -1);
        updateKeypadUI();
    };

    window.keypadEvaluate = function() {
        if (!keypadExpression) return;
        try {
            // Safe evaluation of sanitized basic arithmetic
            const sanitized = keypadExpression.replace(/×/g, '*').replace(/÷/g, '/');
            if (/[^0-9+\-*/.%() ]/.test(sanitized)) {
                throw new Error('Invalid syntax');
            }
            // Evaluate safe arithmetic expression
            const res = Function(`'use strict'; return (${sanitized})`)();
            const formatted = Number.isInteger(res) ? res : parseFloat(res.toFixed(6));
            
            if (historyScreen) historyScreen.textContent = `${keypadExpression} =`;
            if (screen) screen.textContent = formatted.toLocaleString('id-ID');

            addHistoryItem({
                num1: keypadExpression,
                num2: '',
                op: '=',
                rawResult: res,
                formattedResult: formatted.toLocaleString('id-ID'),
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });

            keypadExpression = String(formatted);
        } catch (e) {
            if (screen) screen.textContent = 'Error';
        }
    };

    function updateKeypadUI() {
        if (screen) {
            screen.textContent = keypadExpression || '0';
        }
    }
}

/**
 * Setup Event Listeners & Keyboard Shortcuts
 */
function setupEventListeners() {
    const in1 = document.getElementById('angka1');
    const in2 = document.getElementById('angka2');

    // Real-time calculation when typing (if both have values)
    const handleInput = () => {
        if (in1.value.trim() !== '' && in2.value.trim() !== '') {
            hitung(currentOperator);
        }
    };

    in1.addEventListener('input', handleInput);
    in2.addEventListener('input', handleInput);

    // Keyboard support: Enter to calculate, Escape to reset
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (document.activeElement === in1 || document.activeElement === in2) {
                hitung(currentOperator);
            }
        } else if (e.key === 'Escape') {
            resetCalculator();
        }
    });
}

/**
 * Theme Toggle (Dark & Light Mode)
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Default to sleek dark mode
    setTheme(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        themeBtn.title = theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap';
    }
}