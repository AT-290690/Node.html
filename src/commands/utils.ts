import {
  consoleElement,
  alertIcon,
  errorIcon,
  droneButton,
  keyIcon
} from '../main.js';
import { CodeMirrorType } from '../types';
const editor = window['CodeMirror'] as CodeMirrorType;
export const print = function (...values) {
  values.forEach(
    x => (consoleElement.value += `${JSON.stringify(x) ?? undefined}`)
  );
  return values;
};
export const printErrors = errors => {
  consoleElement.classList.remove('info_line');
  consoleElement.classList.add('error_line');
  consoleElement.value = errors;
};

export const correctFilePath = filename => {
  if (!filename) return '';
  return '/' + filename.split('/').filter(Boolean).join('/');
};
export const State = {
  activeWindow: null,
  isErrored: true,
  mute: localStorage.getItem('mute') ? +localStorage.getItem('mute') : 1,
  topLevel: '',
  source: '',
  settings: {}
};

export const extractTopLevel = (source, tag) => {
  const regex = new RegExp(`\\<${tag}\\>([\\s\\S]+?)\\<\\/${tag}>`, 'g');
  let result = [],
    matches;
  while ((matches = regex.exec(source))) {
    result.push(matches[1]);
  }
  return result;
};

export const droneIntel = icon => {
  icon.style.visibility = 'visible';
  setTimeout(() => {
    icon.style.visibility = 'hidden';
  }, 500);
};
const sounds = [];
for (const sound of document.getElementsByTagName('audio')) {
  sound.volume = sound.volume * 0.1;
  sounds.push(sound);
}
export const playSound = index => {
  if (!State.mute) {
    sounds.forEach((sound, i) => {
      if (i === index) {
        sound.currentTime = 0;
      } else {
        sound.pause();
        sound.currentTime = 0;
      }
    });
    sounds[index].play();
  }
};
export const exe = (source, params) => {
  try {
    const result = new Function(`${params.topLevel};${source}`)();
    droneButton.classList.remove('shake');
    droneIntel(alertIcon);
    playSound(6);
    return result;
  } catch (err) {
    consoleElement.classList.remove('info_line');
    consoleElement.classList.add('error_line');
    consoleElement.value = consoleElement.value.trim() || err + ' ';
    droneButton.classList.remove('shake');
    droneButton.classList.add('shake');

    droneIntel(errorIcon);
    playSound(0);
  }
};

export const saveFile = () => {
  consoleElement.classList.add('info_line');
  consoleElement.classList.remove('error_line');
  droneButton.classList.remove('shake');
  droneIntel(alertIcon);
  playSound(6);
  consoleElement.value = 'File saved!';
};
export const downloadFile = () => {
  playSound(3);
  droneIntel(keyIcon);
};

export const extractScript = (source: string) =>
  source.split('<script>')[1].split('</script>')[0];

export const run = () => {
  consoleElement.classList.add('info_line');
  consoleElement.classList.remove('error_line');
  consoleElement.value = '';
  const source = (State.source = editor.getValue());
  if (source.includes('<script')) {
    const out = exe(extractScript(source.trim()), {
      topLevel: State.topLevel
    });
    if (out !== undefined) print(out);
  }

  return source;
};
