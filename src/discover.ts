import { Tree } from '@lezer/common';
import {
  WidgetOptions,
  parseCallExpression,
  parseColorLiteral,
  parseNamedColor,
  ColorData,
  ColorType
} from './picker';
import { Text } from '@codemirror/state';
import { namedRColors } from './named-r-colors';

function parseNamedRColor(colorName: string): ColorData | null {
  const color = namedRColors.get(colorName);

  if (!color) {
    return null;
  }

  return {
    colorType: ColorType.named,
    color,
    alpha: ''
  };
}

const tableauColors = new Map<string, string>([
  ['tab:blue', '#1f77b4'],
  ['tab:orange', '#ff7f0e'],
  ['tab:green', '#2ca02c'],
  ['tab:red', '#d62728'],
  ['tab:purple', '#9467bd'],
  ['tab:brown', '#8c564b'],
  ['tab:pink', '#e377c2'],
  ['tab:gray', '#7f7f7f'],
  ['tab:olive', '#bcbd22'],
  ['tab:cyan', '#17becf']
]);

export interface IDiscoveryOptions {
  matplotlibTableau: boolean;
}

function parseNamedTableauColors(colorName: string): ColorData | null {
  const color = tableauColors.get(colorName);

  if (!color) {
    return null;
  }

  return {
    colorType: ColorType.named,
    color,
    alpha: ''
  };
}

const cssParsers = [parseCallExpression, parseColorLiteral, parseNamedColor];

export function discoverColorsInStrings(settings: IDiscoveryOptions) {
  return (
    syntaxTree: Tree,
    from: number,
    to: number,
    typeName: string,
    doc: Text,
    language?: string
  ): WidgetOptions | Array<WidgetOptions> | null => {
    const discoverColor = (from: number, to: number, parsers = cssParsers) => {
      const value = doc.sliceString(from, to);
      let data: ColorData | null = null;
      for (const parser of parsers) {
        data = parser(value);
        if (data) {
          break;
        }
      }
      if (!data) {
        return null;
      }
      return {
        ...data,
        from: from,
        to: to
      };
    };

    switch (language) {
      case 'python': {
        if (typeName === 'String' || typeName === 'FormatString') {
          // the Python mode includes both delimiters (single quote or double quote)
          const value = doc.sliceString(from, to);
          // Python string may start with `r`, `f`, `u`, `b` prefixes or a combination of those
          const quoteOffset = value.search(/'|"/);
          if (quoteOffset === -1) {
            return null;
          }
          const parsers = [...cssParsers];
          if (settings.matplotlibTableau) {
            parsers.push(parseNamedTableauColors);
          }
          return discoverColor(from + quoteOffset + 1, to - 1, parsers);
        }
        return null;
      }
      case 'r': {
        if (typeName === 'string') {
          if (from !== to - 1) {
            return discoverColor(from, to - 1, [
              parseNamedRColor,
              ...cssParsers
            ]);
          }
        }
        return null;
      }
      case 'julia': {
        if (typeName === 'string') {
          return discoverColor(from + 1, to);
        }
        return null;
      }
      case 'javascript': {
        if (typeName === 'string') {
          return discoverColor(from + 1, to - 1);
        }
        return null;
      }
      case 'typescript': {
        if (typeName === 'string') {
          return discoverColor(from + 1, to - 1);
        }
        return null;
      }
    }

    return null;
  };
}
