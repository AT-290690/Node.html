import { execute } from './commands/exec.js';
import { saveFile } from './commands/utils.js';
export const consoleElement = document.getElementById('console') as any;
export const editorContainer = document.getElementById('editor-container');
export const mainContainer = document.getElementById('main-container');
export const headerContainer = document.getElementById('header');
export const keyButton = document.getElementById('key');
export const compositionContainer = document.getElementById(
  'composition-container'
);
export const editorResizerElement = document.getElementById('editor-resizer');
export const consoleResizerElement = document.getElementById('console-resizer');

document.addEventListener('keydown', e => {
  const activeElement = document.activeElement;
  if (activeElement === consoleElement && e.key === 'Enter') {
    execute(consoleElement);
  } else if (e.key && e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    e.stopPropagation();
    saveFile();
  }
});
