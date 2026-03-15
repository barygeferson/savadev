export interface IdeFile {
  id: string;
  name: string;
  content: string;
  modified?: boolean;
}

export type RunMode = 'interpreter' | 'vm';
export type SidePanel = 'explorer' | 'search' | 'settings' | null;

export interface IdeSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  theme: 'dark' | 'darker' | 'midnight';
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  fontFamily: string;
}
