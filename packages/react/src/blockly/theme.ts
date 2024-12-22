import * as Blockly from 'blockly';

export const theme = Blockly.Theme.defineTheme('themeName', {
  name: 'QLogic',
  base: Blockly.Themes.Classic,
  'blockStyles': {
    'logic_blocks': { 'colourPrimary': '#99caea' }, // Light blue for Logic
    'loop_blocks': { 'colourPrimary': '#B5E1A0' }, // Light green for Loops
    'math_blocks': { 'colourPrimary': '#D5A6FF' }, // Purple for Math
    'text_blocks': { 'colourPrimary': '#FFD966' }, // Yellow for Text
    'list_blocks': { 'colourPrimary': '#bde5ef' }, // Aqua for Lists
    'colour_blocks': { 'colourPrimary': '#D9A3FF' }, // Light violet for Colour
    'variable_blocks': { 'colourPrimary': '#FFB6C1' }, // Pink for Variables
    'function_blocks': { 'colourPrimary': '#D9B4FF' }, // Lilac for Functions
  },
  'categoryStyles': {
    'logic_category': { 'colour': '#95b9d1' },
    'loop_category': { 'colour': '#B5E1A0' },
    'math_category': { 'colour': '#D5A6FF' },
    'text_category': { 'colour': '#FFD966' },
    'list_category': { 'colour': '#839ba1' },
    'colour_category': { 'colour': '#D9A3FF' },
    'variable_category': { 'colour': '#FFB6C1' },
    'function_category': { 'colour': '#D9B4FF' },
  },
  'fontStyle': {
    'family': 'Arial, sans-serif',
    'weight': 'normal',
    'size': 12,
  },
});