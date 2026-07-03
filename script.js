const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

const opSymbols = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷'
};

function updateDisplay() {
    resultEl.textContent = formatNumber(current);
    if (operator && previous !== null) {
        expressionEl.textContent = `${formatNumber(previous)} ${opSymbols[operator]}`;
    } else if (justEvaluated && previous !== null) {
        expressionEl.textContent = `${formatNumber(previous)} ${opSymbols[operator] || ''} ${formatNumber(lastOperand)} =`;
    } else {
        expressionEl.textContent = '';
    }
}

function formatNumber(numStr) {
    if (numStr === null || numStr === undefined) return '';
    const num = parseFloat(numStr);
    if (isNaN(num)) return '0';
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-9 && num !== 0)) {
        return num.toExponential(4);
    }
    const parts = numStr.toString().split('.');
    parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
    return parts.join('.');
}

function inputDigit(digit) {
    if (justEvaluated) {
        current = digit;
        justEvaluated = false;
    } else {
        current = current === '0' ? digit : current + digit;
    }
    updateDisplay();
}

function inputDecimal() {
    if (justEvaluated) {
        current = '0.';
        justEvaluated = false;
    } else if (!current.includes('.')) {
        current += '.';
    }
    updateDisplay();
}

function clearAll() {
    current = '0';
    previous = null;
    operator = null;
    justEvaluated = false;
    updateDisplay();
    clearActiveOps();
}

function negate() {
    if (current !== '0') {
        current = current.startsWith('-') ? current.slice(1) : '-' + current;
    }
    updateDisplay();
}

function percent() {
    current = (parseFloat(current) / 100).toString();
    updateDisplay();
}

let lastOperand = null;

function chooseOperator(op) {
    if (operator && previous !== null && !justEvaluated) {
        compute();
    }
    previous = current;
    operator = op;
    current = '0';
    justEvaluated = false;
    updateDisplay();
    highlightOperator(op);
}

function compute() {
    if (operator === null || previous === null) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    let result;

    switch (operator) {
        case 'add': result = a + b; break;
        case 'subtract': result = a - b; break;
        case 'multiply': result = a * b; break;
        case 'divide': result = b === 0 ? NaN : a / b; break;
        default: return;
    }

    lastOperand = current;
    current = isNaN(result) ? 'Error' : result.toString();
    previous = a.toString();
    justEvaluated = true;
    updateDisplay();
    clearActiveOps();
}

function highlightOperator(op) {
    clearActiveOps();
    const btn = document.querySelector(`[data-action="${op}"]`);
    if (btn) btn.classList.add('active');
}

function clearActiveOps() {
    document.querySelectorAll('.key.op').forEach(b => b.classList.remove('active'));
}

document.querySelectorAll('.key').forEach(button => {
    button.addEventListener('click', () => {
        const num = button.dataset.num;
        const action = button.dataset.action;

        if (num !== undefined) {
            inputDigit(num);
            return;
        }

        switch (action) {
            case 'clear': clearAll(); break;
            case 'negate': negate(); break;
            case 'percent': percent(); break;
            case 'decimal': inputDecimal(); break;
            case 'equals': compute(); break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                chooseOperator(action);
                break;
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); }
    else if (e.key === '.') { inputDecimal(); }
    else if (e.key === '+') { chooseOperator('add'); }
    else if (e.key === '-') { chooseOperator('subtract'); }
    else if (e.key === '*') { chooseOperator('multiply'); }
    else if (e.key === '/') { e.preventDefault(); chooseOperator('divide'); }
    else if (e.key === 'Enter' || e.key === '=') { compute(); }
    else if (e.key === 'Escape') { clearAll(); }
    else if (e.key === '%') { percent(); }
    else if (e.key === 'Backspace') {
        current = current.length > 1 ? current.slice(0, -1) : '0';
        updateDisplay();
    }
});

updateDisplay();