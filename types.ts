
export enum KeyType {
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  FUNCTION = 'FUNCTION',
  COMMAND = 'COMMAND',
  MEMORY = 'MEMORY',
  MODE = 'MODE'
}

export interface CalculatorButton {
  label: string;
  shiftLabel?: string;
  alphaLabel?: string;
  type: KeyType;
  value: string;
  color?: string;
  labelColor?: string;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface ScientificConstant {
  symbol: string;
  name: string;
  nameBn: string;
  value: string;
  unit: string;
}

export type AppTab = 'CALC' | 'GRAPH' | 'CONVERT' | 'CONST' | 'HISTORY' | 'SETTINGS' | 'AGE' | 'ADV';

export enum AngleUnit {
  DEG = 'Deg',
  RAD = 'Rad',
  GRAD = 'Grad'
}

export interface CustomTheme {
  background: string;
  button: string;
  lcd: string;
  text: string;
}

export type ThemePreset = 'CLASSIC' | 'DARK' | 'LIGHT' | 'CUSTOM';
