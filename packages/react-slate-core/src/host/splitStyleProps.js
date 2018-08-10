/* @flow */

function splitOffsets(name: string, value: string) {
  const offsets = value.match(/\d+/g);
  if (!offsets) {
    return null;
  }

  const output = {
    [`${name}Top`]: Number(offsets[0]),
    [`${name}Right`]: Number(offsets[1]),
    [`${name}Bottom`]: Number(offsets[2]),
    [`${name}Left`]: Number(offsets[3]),
  };

  if (offsets.length === 3) {
    output[`${name}Left`] = output[`${name}Right`];
  } else if (offsets.length === 2) {
    output[`${name}Left`] = output[`${name}Right`];
    output[`${name}Bottom`] = output[`${name}Top`];
  } else if (offsets.length === 1) {
    // eslint-disable-next-line no-multi-assign
    output[`${name}Left`] = output[`${name}Right`] = output[`${name}Bottom`] =
      output[`${name}Top`];
  } else if (offsets.length === 0) {
    return null;
  }
  return output;
}

function splitBorder(value: string) {
  const [thickness, color, backgroundColor] = value.split(' ');
  return {
    thickness,
    color,
    backgroundColor,
  };
}

function normalize(value: { [key: string]: * }, alternativeValue = null) {
  const keys = Object.keys(value);
  return keys.length
    ? keys.reduce(
        (acc, key) =>
          value[key] !== null && typeof value[key] !== 'undefined'
            ? { ...acc, [key]: value[key] }
            : acc,
        null
      )
    : alternativeValue;
}

export default function splitStyleProps(
  props?: ?{ [key: string]: * } | Array<?{ [key: string]: * }>
) {
  if (
    typeof props === 'boolean' ||
    typeof props === 'undefined' ||
    props === null
  ) {
    return {
      layoutProps: null,
      styleProps: null,
      borderProps: null,
    };
  }

  if (Array.isArray(props)) {
    return props.reduce(
      (acc, item) => {
        const { layoutProps, styleProps, borderProps } = splitStyleProps(item);
        return {
          layoutProps: normalize({
            ...acc.layoutProps,
            ...layoutProps,
          }),
          styleProps: normalize({
            ...acc.styleProps,
            ...styleProps,
          }),
          borderProps: normalize({
            ...acc.borderProps,
            ...borderProps,
          }),
        };
      },
      {
        layoutProps: null,
        styleProps: null,
        borderProps: null,
      }
    );
  }

  const {
    display,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    padding,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    height,
    width,
    backgroundColor,
    color,
    fontWeight,
    fontStyle,
    textDecoration,
    textTransform,
    textAlign,
    border,
    borderStyle,
    borderColor,
    borderBackgroundColor,
  } = props;
  const borderProps = splitBorder(border || '');

  return {
    layoutProps: normalize({
      ...(splitOffsets('margin', margin || '') || {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
      }),
      ...(splitOffsets('padding', padding || '') || {
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
      }),
      display,
      width,
      height,
    }),
    styleProps: normalize({
      backgroundColor,
      color,
      fontWeight,
      fontStyle,
      textDecoration,
      textTransform,
      textAlign,
    }),
    borderProps:
      borderStyle && borderProps.thickness
        ? normalize({
            thickness: borderStyle || borderProps.thickness,
            color: borderColor || borderProps.color,
            backgroundColor:
              borderBackgroundColor || borderProps.backgroundColor,
          })
        : null,
  };
}
