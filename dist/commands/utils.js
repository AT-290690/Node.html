import { consoleElement } from '../main.js';
export const print = function (...values) {
    values.forEach(x => { var _a; return (consoleElement.value += `${(_a = JSON.stringify(x)) !== null && _a !== void 0 ? _a : undefined}`); });
    return values;
};
export const printErrors = errors => {
    consoleElement.classList.remove('info_line');
    consoleElement.classList.add('error_line');
    consoleElement.value = errors;
};
export const State = {
    activeWindow: null,
    source: '',
    settings: {}
};
export const saveFile = () => {
    consoleElement.classList.add('info_line');
    consoleElement.classList.remove('error_line');
    consoleElement.value = 'File saved!';
};
