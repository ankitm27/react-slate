/* @flow */

import chalk from 'chalk';

chalk.enabled = process.env.CI ? true : chalk.enabled;
chalk.level = process.env.CI ? 1 : chalk.level;

function capitalize(text: string) {
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}

function colorize(color: string, isBackground: boolean, text: string) {
  if (color.startsWith('#')) {
    return isBackground ? chalk.bgHex(color)(text) : chalk.hex(color)(text);
  } else if (color.startsWith('rgb')) {
    const rgbColorMatch = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/.exec(color);
    if (rgbColorMatch) {
      const [r, g, b] = rgbColorMatch.slice(1, 4).map(e => parseInt(e, 10));
      return isBackground
        ? chalk.bgRgb(r, g, b)(text)
        : chalk.rgb(r, g, b)(text);
    }

    const rgbKeywordMatch = /rgb\((.+)\)/.exec(color);
    if (rgbKeywordMatch) {
      return isBackground
        ? chalk.bgKeyword(rgbKeywordMatch[1])(text)
        : chalk.keyword(rgbKeywordMatch[1])(text);
    }

    return text;
  }

  return isBackground
    ? // $FlowFixMe
      chalk[`bg${capitalize(color)}`](text)
    : // $FlowFixMe
      chalk[color](text);
}

function applySingleStyle(key: string, value: string, text: string) {
  switch (key) {
    case 'color':
      return colorize(value, false, text);
    case 'backgroundColor':
      return colorize(value, true, text);
    case 'fontWeight':
      return value === 'bold' ? chalk.bold(text) : text;
    case 'fontStyle':
      return value === 'italic' ? chalk.italic(text) : text;
    case 'textDecoration': {
      switch (value) {
        case 'line-through':
          return chalk.strikethrough(text);
        case 'underline':
          return chalk.underline(text);
        default:
          return text;
      }
    }
    case 'textTransform': {
      switch (value) {
        case 'uppercase':
          return text.toUpperCase();
        case 'lowercase':
          return text.toLowerCase();
        case 'capitalize':
          return capitalize(text);
        default:
          return text;
      }
    }
    default:
      return text;
  }
}

export default function applyStyle(
  style: { [key: string]: string },
  text: string
) {
  return chalk.reset(
    Object.keys(style).reduce(
      (output, key) => applySingleStyle(key, style[key], output),
      text
    )
  );
}
