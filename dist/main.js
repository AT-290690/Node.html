import { execute } from './commands/exec.js';
import { run, saveFile, downloadFile } from './commands/utils.js';
export const consoleElement = document.getElementById('console');
export const editorContainer = document.getElementById('editor-container');
export const mainContainer = document.getElementById('main-container');
export const headerContainer = document.getElementById('header');
export const focusButton = document.getElementById('focus-button');
export const keyButton = document.getElementById('key');
export const droneButton = document.getElementById('drone');
export const alertIcon = document.getElementById('alert-drone-icon');
export const errorIcon = document.getElementById('error-drone-icon');
export const formatterIcon = document.getElementById('formatter-drone-icon');
export const keyIcon = document.getElementById('key-drone-icon');
export const questionIcon = document.getElementById('question-drone-icon');
export const xIcon = document.getElementById('x-drone-icon');
export const compositionContainer = document.getElementById('composition-container');
export const editorResizerElement = document.getElementById('editor-resizer');
export const consoleResizerElement = document.getElementById('console-resizer');
droneButton.addEventListener('click', () => run());
keyButton.addEventListener('click', () => {
    downloadFile();
});
document.addEventListener('keydown', e => {
    const activeElement = document.activeElement;
    if (activeElement === consoleElement && e.key === 'Enter') {
        execute(consoleElement);
    }
    else if (e.key && e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        saveFile();
    }
});
