const { Node, Text, Root, calculateLayout, render } = require('./');

const root = new Root({ width: 30, height: 10 });
const node = new Node();
const text = new Text();
text.setBody('Hello World');
node.insertChild(text);
node.setLayoutProps({
  // width: 13,
  height: 3,
  // paddingLeft: 1,
  paddingTop: 1,
  // paddingBottom: 1,
});
node.setStyleProps({ backgroundColor: 'green', color: 'white' });
root.insertChild(node);

console.log(
  render(calculateLayout(root).renderElements, { width: 30, height: 10 })
);
