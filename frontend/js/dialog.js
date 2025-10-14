// frontend/js/dialog.js

const dialogOverlay = document.getElementById('global-dialog-overlay');
const dialogTitle = document.getElementById('global-dialog-title');
const dialogMessage = document.getElementById('global-dialog-message');
const dialogInput = document.getElementById('global-dialog-input'); // Added
const confirmBtn = document.getElementById('global-dialog-confirm-btn');
const cancelBtn = document.getElementById('global-dialog-cancel-btn');

let currentOnConfirm = null;
let currentOnCancel = null;
let autoCloseTimeout = null;

function resetDialog() {
    dialogTitle.textContent = '';
    dialogMessage.textContent = '';
    dialogInput.value = ''; // Added
    dialogInput.style.display = 'none'; // Added
    confirmBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    currentOnConfirm = null;
    currentOnCancel = null;
    if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
        autoCloseTimeout = null;
    }
}

function hideDialog() {
    dialogOverlay.classList.remove('visible');
    resetDialog();
}

confirmBtn.addEventListener('click', () => {
    const callback = currentOnConfirm;
    const inputValue = dialogInput.style.display === 'block' ? dialogInput.value : undefined;
    hideDialog();
    if (callback) {
        callback(inputValue);
    }
});

cancelBtn.addEventListener('click', () => {
    const callback = currentOnCancel;
    hideDialog();
    if (callback) {
        callback();
    }
});

/**
 * Shows a global dialog.
 * @param {object} options - Dialog options.
 * @param {string} options.message - The message to display.
 * @param {string} [options.title='알림'] - The title of the dialog.
 * @param {boolean} [options.showConfirmButton=true] - Whether to show the confirm button.
 * @param {boolean} [options.showCancelButton=false] - Whether to show the cancel button.
 * @param {boolean} [options.autoClose=false] - Whether the dialog should auto-close.
 * @param {number} [options.duration=3000] - Duration in ms if autoClose is true.
 * @param {boolean} [options.showInputField=false] - Whether to show an input field.
 * @param {string} [options.inputType='text'] - Type of the input field (e.g., 'text', 'email', 'password').
 * @param {string} [options.inputPlaceholder=''] - Placeholder for the input field.
 * @param {string} [options.inputValue=''] - Initial value for the input field.
 * @param {function} [options.onConfirm] - Callback function when confirm button is clicked. Receives input value if showInputField is true.
 * @param {function} [options.onCancel] - Callback function when cancel button is clicked.
 */
export function showDialog(options) {
    resetDialog();

    dialogTitle.textContent = options.title || '알림';
    dialogMessage.textContent = options.message;

    if (options.showConfirmButton === false) {
        confirmBtn.style.display = 'none';
    }
    if (options.showCancelButton === false) {
        cancelBtn.style.display = 'none';
    }

    if (options.showInputField) {
        dialogInput.type = options.inputType || 'text';
        dialogInput.placeholder = options.inputPlaceholder || '';
        dialogInput.value = options.inputValue || '';
        dialogInput.style.display = 'block';
    }

    currentOnConfirm = options.onConfirm;
    currentOnCancel = options.onCancel;

    dialogOverlay.classList.add('visible');

    if (options.autoClose) {
        autoCloseTimeout = setTimeout(hideDialog, options.duration || 3000);
    }
}
