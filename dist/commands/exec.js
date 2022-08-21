var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { consoleElement } from '../main.js';
import { printErrors, State } from './utils.js';
const editor = window['CodeMirror'];
export const execute = (CONSOLE) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    consoleElement.classList.remove('error_line');
    consoleElement.classList.add('info_line');
    const selectedConsoleLine = CONSOLE.value.trim();
    const [CMD, ...PARAMS] = selectedConsoleLine.split(' ');
    switch ((_a = CMD === null || CMD === void 0 ? void 0 : CMD.trim()) === null || _a === void 0 ? void 0 : _a.toUpperCase()) {
        case 'EMP':
            State.source = editor.getValue();
            editor.setValue('');
            consoleElement.value = '';
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
            break;
        case '<>':
            editor.setValue(`<script>\n${editor.getValue()}\n</script>`);
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
 EMP: clears the editor content
 <>: wrap editor content in a script tag
 LICENSE: read license info
 ----------------------------
*/`);
            consoleElement.value = '';
            break;
        default:
            if (CMD.trim())
                printErrors(CMD + ' does not exist!');
            else
                consoleElement.value = '';
            break;
    }
});
