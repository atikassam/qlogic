import * as Blockly from 'blockly';

export const theme = Blockly.Theme.defineTheme('modest', {
  name: 'modest',
  fontStyle: {
    family: 'Google Sans',
    weight: 'bold',
    size: 16,
  },
  blockStyles: {
    logic_blocks: {
      colourPrimary: '#D1C4E9',
      colourSecondary: '#EDE7F6',
      colourTertiary: '#B39DDB',
    },
    loop_blocks: {
      colourPrimary: '#A5D6A7',
      colourSecondary: '#E8F5E9',
      colourTertiary: '#66BB6A',
    },
    math_blocks: {
      colourPrimary: '#2196F3',
      colourSecondary: '#1E88E5',
      colourTertiary: '#0D47A1',
    },
    text_blocks: {
      colourPrimary: '#FFCA28',
      colourSecondary: '#FFF8E1',
      colourTertiary: '#FF8F00',
    },
    list_blocks: {
      colourPrimary: '#4DB6AC',
      colourSecondary: '#B2DFDB',
      colourTertiary: '#009688',
    },
    variable_blocks: {
      colourPrimary: '#EF9A9A',
      colourSecondary: '#FFEBEE',
      colourTertiary: '#EF5350',
    },
    variable_dynamic_blocks: {
      colourPrimary: '#EF9A9A',
      colourSecondary: '#FFEBEE',
      colourTertiary: '#EF5350',
    },
    procedure_blocks: {
      colourPrimary: '#D7CCC8',
      colourSecondary: '#EFEBE9',
      colourTertiary: '#BCAAA4',
    },
  },
})