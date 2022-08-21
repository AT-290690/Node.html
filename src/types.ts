export interface CodeMirrorType {
  getValue: () => string;
  setValue: (value: string) => void;
  setSize: (w: number, h: number) => void;
}
