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

export default function splitProps(props: { [key: string]: any }) {
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
  } = props;

  return {
    layoutProps: {
      ...(splitOffsets('margin', margin || '') || {
        marginTop: marginTop || 0,
        marginBottom: marginBottom || 0,
        marginLeft: marginLeft || 0,
        marginRight: marginRight || 0,
      }),
      ...(splitOffsets('padding', padding || '') || {
        paddingTop: paddingTop || 0,
        paddingBottom: paddingBottom || 0,
        paddingLeft: paddingLeft || 0,
        paddingRight: paddingRight || 0,
      }),
      display,
      width,
      height,
    },
    styleProps: {
      backgroundColor,
      color,
      fontWeight,
      fontStyle,
      textDecoration,
      textTransform,
      textAlign,
    },
    borderProps: null,
    ...(splitOffsets('margin', margin || '') || {
      marginTop: marginTop || 0,
      marginBottom: marginBottom || 0,
      marginLeft: marginLeft || 0,
      marginRight: marginRight || 0,
    }),
  };
}
