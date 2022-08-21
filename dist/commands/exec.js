var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { alertIcon, consoleElement, errorIcon, keyIcon, questionIcon, xIcon } from '../main.js';
import { printErrors, playSound, State, droneIntel } from './utils.js';
const editor = window['CodeMirror'];
export const execute = (CONSOLE) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    consoleElement.classList.remove('error_line');
    consoleElement.classList.add('info_line');
    const selectedConsoleLine = CONSOLE.value.trim();
    const [CMD, ...PARAMS] = selectedConsoleLine.split(' ');
    switch ((_a = CMD === null || CMD === void 0 ? void 0 : CMD.trim()) === null || _a === void 0 ? void 0 : _a.toUpperCase()) {
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
                if (key.includes('stash-'))
                    out.push(key.split('stash-')[1]);
            }
            editor.setValue(out.length
                ? `/*
Code stash: 

${out.join('\n')}

LOAD name
*/`
                : `/* 
Your code stash is empty...

SAVE name
*/`);
            playSound(3);
            droneIntel(keyIcon);
            break;
        case 'LOAD':
            State.source = editor.getValue();
            editor.setValue(localStorage.getItem(PARAMS[0] ? 'stash-' + PARAMS[0] : 'stash-main'));
            playSound(3);
            droneIntel(keyIcon);
            consoleElement.value = '';
            break;
        case 'SAVE':
            consoleElement.value = '';
            localStorage.setItem(PARAMS[0] ? 'stash-' + PARAMS[0] : 'stash-main', editor.getValue());
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
                if (key.includes('stash-'))
                    localStorage.removeItem(key);
            }
            consoleElement.value = '';
            editor.setValue('');
            droneIntel(xIcon);
            playSound(5);
            break;
        case 'SOUND':
            switch ((_b = PARAMS[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) {
                case 'ON':
                    State.mute = 0;
                    localStorage.setItem('mute', '0');
                    droneIntel(alertIcon);
                    break;
                case 'OFF':
                    State.mute = 1;
                    localStorage.setItem('mute', '1');
                    droneIntel(xIcon);
                    break;
            }
            break;
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
            if (CMD.trim())
                printErrors(CMD + ' does not exist!');
            else
                consoleElement.value = '';
            droneIntel(errorIcon);
            playSound(0);
            break;
    }
});
