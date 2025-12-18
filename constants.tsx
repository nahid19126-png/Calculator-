
import { CalculatorButton, KeyType } from './types';

export const TOP_ROW_LEFT: CalculatorButton[] = [
  { label: 'SHIFT', type: KeyType.COMMAND, value: 'SHIFT', color: 'bg-[#d4a017]' },
  { label: 'ALPHA', type: KeyType.COMMAND, value: 'ALPHA', color: 'bg-[#b22222]' },
];

export const TOP_ROW_RIGHT: CalculatorButton[] = [
  { label: 'MODE', shiftLabel: 'CLR', type: KeyType.MODE, value: 'MODE', color: 'bg-[#4a4a4a]' },
  { label: 'ON', type: KeyType.COMMAND, value: 'ON', color: 'bg-[#4a4a4a]' },
];

export const SCI_BUTTONS: CalculatorButton[] = [
  { label: 'x³', shiftLabel: '∛', type: KeyType.FUNCTION, value: 'x³' },
  { label: 'x²', shiftLabel: '√', type: KeyType.FUNCTION, value: 'x²' },
  { label: 'ab/c', shiftLabel: 'd/c', type: KeyType.FUNCTION, value: 'frac' },
  { label: '√', shiftLabel: '∛', type: KeyType.FUNCTION, value: 'sqrt' },
  { label: '^', shiftLabel: 'x²', type: KeyType.FUNCTION, value: '^' },
  { label: 'log', shiftLabel: '10ˣ', type: KeyType.FUNCTION, value: 'log' },
  { label: 'ln', shiftLabel: 'eˣ', type: KeyType.FUNCTION, value: 'ln' },
  { label: 'sin', shiftLabel: 'sin⁻¹', type: KeyType.FUNCTION, value: 'sin' },
  { label: 'cos', shiftLabel: 'cos⁻¹', type: KeyType.FUNCTION, value: 'cos' },
  { label: 'tan', shiftLabel: 'tan⁻¹', type: KeyType.FUNCTION, value: 'tan' },
  { label: 'hyp', shiftLabel: 'C', type: KeyType.FUNCTION, value: 'hyp' },
  { label: '(-)', shiftLabel: 'A', type: KeyType.FUNCTION, value: 'neg' },
  { label: 'RCL', shiftLabel: 'STO', type: KeyType.MEMORY, value: 'rcl' },
  { label: 'ENG', shiftLabel: '←', type: KeyType.FUNCTION, value: 'eng' },
  { label: '(', shiftLabel: '%', type: KeyType.OPERATOR, value: '(' },
  { label: ')', shiftLabel: ',', type: KeyType.OPERATOR, value: ')' },
  { label: 'M+', shiftLabel: 'M-', alphaLabel: 'M', type: KeyType.MEMORY, value: 'mplus' },
  { label: '∫dx', shiftLabel: 'd/dx', type: KeyType.FUNCTION, value: 'int' },
];

export const MAIN_BUTTONS: CalculatorButton[] = [
  { label: '7', type: KeyType.NUMBER, value: '7' },
  { label: '8', type: KeyType.NUMBER, value: '8' },
  { label: '9', type: KeyType.NUMBER, value: '9' },
  { label: 'DEL', shiftLabel: 'OFF', type: KeyType.COMMAND, value: 'DEL', color: 'bg-orange-600' },
  { label: 'AC', shiftLabel: 'MC', type: KeyType.COMMAND, value: 'AC', color: 'bg-orange-600' },
  { label: '4', type: KeyType.NUMBER, value: '4' },
  { label: '5', type: KeyType.NUMBER, value: '5' },
  { label: '6', type: KeyType.NUMBER, value: '6' },
  { label: '×', type: KeyType.OPERATOR, value: '*' },
  { label: '÷', type: KeyType.OPERATOR, value: '/' },
  { label: '1', type: KeyType.NUMBER, value: '1' },
  { label: '2', type: KeyType.NUMBER, value: '2' },
  { label: '3', type: KeyType.NUMBER, value: '3' },
  { label: '+', type: KeyType.OPERATOR, value: '+' },
  { label: '-', type: KeyType.OPERATOR, value: '-' },
  { label: '0', type: KeyType.NUMBER, value: '0' },
  { label: '.', type: KeyType.NUMBER, value: '.' },
  { label: 'EXP', shiftLabel: 'π', type: KeyType.FUNCTION, value: 'exp' },
  { label: 'Ans', type: KeyType.COMMAND, value: 'Ans' },
  { label: '=', type: KeyType.COMMAND, value: '=' },
];
