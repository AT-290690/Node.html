import {
  alertIcon,
  consoleElement,
  errorIcon,
  formatterIcon,
  keyIcon,
  questionIcon,
  xIcon
} from '../main.js';

import {
  run,
  printErrors,
  playSound,
  State,
  droneIntel,
  extractTopLevel
} from './utils.js';
const editor = window.CodeMirror;
const href = window.location.href.split('/').filter(Boolean);
const envi = href.slice(1, 2);
const protocol = envi[0].includes('localhost') ? 'http://' : 'https://';

const API = protocol + envi.join('/');
const APP = 'YavaScript';
const GIST = 'https://gist.githubusercontent.com/';

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('g')) {
  fetch(`${GIST}${urlParams.get('g')}`)
    .then(buffer => {
      if (buffer.status >= 400)
        return printErrors('Request failed with status ' + buffer.status);
      return buffer.text();
    })
    .then(gist => {
      State.mute = true;
      const topLevel = extractTopLevel(gist, 'vanish');
      State.topLevel = topLevel.length ? topLevel + '\n' : '';
      editor.setValue(
        (State.source = topLevel.length
          ? gist.replace(`//<vanish>${topLevel}</vanish>`, '').trimStart()
          : gist)
      );
    })
    .then(() => (urlParams.has('r') ? run() : null))
    .finally(() => (State.mute = +localStorage.getItem('mute')))
    .catch(err => printErrors(err));
}

export const execute = async CONSOLE => {
  consoleElement.classList.remove('error_line');
  consoleElement.classList.add('info_line');
  const selectedConsoleLine = CONSOLE.value.trim();
  const [CMD, ...PARAMS] = selectedConsoleLine.split(' ');
  switch (CMD?.trim()?.toUpperCase()) {
    case 'EMPTY':
      State.source = editor.getValue();
      editor.setValue('');
      consoleElement.value = '';
      playSound(5);
      droneIntel(xIcon);
      break;
    case 'ABOUT':
      State.source = editor.getValue();
      editor.setValue(`/* 
  Notepad.js

  ✨ Features ✨

  * Write and Run simple JavaScript snippets
  * Store your snippets in browser storage
  * Share existing github snippets (gysts)
  * Hide certain parts of the snippets
  
*/`);
      droneIntel(questionIcon);
      playSound(5);

      break;
    case 'LICENSE':
      State.source = editor.getValue();
      editor.setValue(`/*
  MIT License

  Copyright (c) 2022 AT-290690
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
      */`);
      droneIntel(questionIcon);
      playSound(5);

      break;
    case 'LIST':
      const out = [];
      for (let i = 0; i < localStorage.length; ++i) {
        const key = localStorage.key(i);
        if (key.includes('stash-')) out.push(key.split('stash-')[1]);
      }
      editor.setValue(
        out.length
          ? `/*
Code stash: 

${out.join('\n')}

LOAD name
*/`
          : `/* 
Your code stash is empty...

SAVE name
*/`
      );
      playSound(3);
      droneIntel(keyIcon);
      break;
    case 'LOAD':
      State.source = editor.getValue();
      editor.setValue(
        localStorage.getItem(PARAMS[0] ? 'stash-' + PARAMS[0] : 'stash-main')
      );
      playSound(3);
      droneIntel(keyIcon);
      consoleElement.value = '';
      break;
    case 'SAVE':
      consoleElement.value = '';
      localStorage.setItem(
        PARAMS[0] ? 'stash-' + PARAMS[0] : 'stash-main',
        editor.getValue()
      );
      playSound(6);
      droneIntel(keyIcon);

      break;
    case 'DELETE':
      State.source = editor.getValue();
      localStorage.removeItem(PARAMS[0] ? 'stash-' + PARAMS[0] : 'stash-main');
      consoleElement.value = '';
      playSound(5);
      droneIntel(xIcon);
      break;
    case 'DROP':
      State.source = editor.getValue();
      for (let i = 0; i < localStorage.length; ++i) {
        const key = localStorage.key(i);
        if (key.includes('stash-')) localStorage.removeItem(key);
      }
      consoleElement.value = '';
      editor.setValue('');
      droneIntel(xIcon);
      playSound(5);
      break;
    case 'SOUND':
      switch (PARAMS[0]?.toUpperCase()) {
        case 'ON':
          State.mute = 0;
          localStorage.setItem('mute', 0);
          droneIntel(alertIcon);
          break;

        case 'OFF':
          State.mute = 1;
          localStorage.setItem('mute', 1);
          droneIntel(xIcon);
          break;
      }
      break;
    // case 'TEST':
    //   const topLevel = extractTopLevel(editor.getValue(), 'vanish');
    //   editor.setValue(
    //     editor
    //       .getValue()
    //       .replace(`//<vanish>${(State.topLevel = topLevel)}</vanish>`, '')
    //       .trimStart()
    //   );
    //   break;
    // case 'PRETTY':
    //   editor.setValue(js_beautify(editor.getValue(), State.settings.beautify));
    //   playSound(4);
    //   droneIntel(formatterIcon);
    //   break;
    // case 'DOWNLOAD':
    //   {
    //     const filename = PARAMS[0];
    //     const a = document.createElement('a');
    //     a.href = ``;
    //     a.setAttribute('download', filename);
    //     a.click();
    //     consoleElement.value = '';
    //   }
    //   break;

    case 'HELP':
      State.source = editor.getValue();
      editor.setValue(`/* 
-----------------------------
 Press on the drone - run code
 Press ctrl/command + s - run code
-----------------------------
 Enter a command in the console
 ---------[COMMANDS]---------
 HELP: list these commands
 EMPTY: clears the editor content
 LIST: list stash content
 SOUND ON:  enable sounds
 SOUND OFF: dissable sounds
 LICENSE: read license info
 ----------------------------
*/`);
      playSound(4);
      droneIntel(questionIcon);
      consoleElement.value = '';
      break;
    default:
      if (CMD.trim()) printErrors(CMD + ' does not exist!');
      else consoleElement.value = '';
      droneIntel(errorIcon);
      playSound(0);
      break;
  }
};
