import Root from '../../nodes/Root';
import Node from '../../nodes/Node';
import Text from '../../nodes/Text';

describe('calculateLayout integration suite', () => {
  describe('should calculate layout', () => {
    describe('for node -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const node = new Node();
        const text = new Text();

        text.setBody('Hello World');
        node.appendChild(text);
        root.appendChild(node);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          marginLeft: 2,
          marginTop: 1,
          paddingTop: 1,
          paddingLeft: 2,
          paddingRight: 2,
          paddingBottom: 1,
        });

        const { layoutTree } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with height constrain and vertical paddings', () => {
        const root = getTree();
        root.children[0].setLayoutProps({
          height: 3,
          paddingTop: 1,
          paddingBottom: 1,
        });
        root.children[0].setStyleProps({
          backgroundColor: 'red',
        });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> node -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerNode = new Node();
        const innerNode = new Node();
        const text = new Text();

        text.setBody('Hello World');
        innerNode.appendChild(text);
        outerNode.appendChild(innerNode);
        root.appendChild(outerNode);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          paddingTop: 1,
          paddingLeft: 1,
        });

        root.children[0].children[0].setLayoutProps({
          paddingTop: 1,
          marginLeft: 2,
          marginRight: 2,
        });

        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width top-level constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrains', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        root.children[0].children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrains and overflow', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        root.children[0].children[0].setLayoutProps({ width: 7 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [text, text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const node = new Node();
        const text1 = new Text();
        const text2 = new Text();

        text1.setBody('Hello');
        text2.setBody(' World');
        node.appendChild(text1);
        node.appendChild(text2);
        root.appendChild(node);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          marginLeft: 2,
          marginTop: 2,
          paddingTop: 1,
          paddingRight: 1,
          paddingBottom: 1,
          paddingLeft: 1,
        });

        const { layoutTree } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [text, node(inline) -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const node = new Node();
        const text1 = new Text();
        const innerNode = new Node();
        const text2 = new Text();

        innerNode.setLayoutProps({
          display: 'inline',
        });

        text1.setBody('Hello');
        text2.setBody(' World');
        innerNode.appendChild(text2);
        node.appendChild(text1);
        node.appendChild(innerNode);
        root.appendChild(node);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          marginLeft: 1,
          marginTop: 1,
        });

        root.children[0].children[1].setLayoutProps({
          marginLeft: 1,
          paddingTop: 1,
          display: 'inline',
        });

        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [text, node -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerNode = new Node();
        const text = new Text();
        const innerNode = new Node();
        const innerText = new Text();

        text.setBody('Hello');
        innerText.setBody('World');
        innerNode.appendChild(innerText);
        outerNode.appendChild(text);
        outerNode.appendChild(innerNode);
        root.appendChild(outerNode);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          paddingTop: 1,
          paddingBottom: 1,
        });

        root.children[0].children[1].setLayoutProps({
          marginLeft: 1,
          marginTop: 1,
          marginRight: 1,
          marginBottom: 1,
        });

        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with non-altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [node -> text, text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerNode = new Node();
        const text = new Text();
        const innerNode = new Node();
        const innerText = new Text();

        text.setBody('World');
        innerText.setBody('Hello');
        innerNode.appendChild(innerText);
        outerNode.appendChild(innerNode);
        outerNode.appendChild(text);
        root.appendChild(outerNode);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          paddingTop: 1,
          paddingBottom: 1,
        });

        root.children[0].children[0].setLayoutProps({
          marginLeft: 1,
          marginTop: 1,
          marginRight: 1,
          marginBottom: 1,
        });

        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with non-altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with height constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 1 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [node -> text, node -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerNode = new Node();
        const innerNode1 = new Node();
        const text1 = new Text();
        const innerNode2 = new Node();
        const text2 = new Text();

        text1.setBody('Hello');
        text2.setBody('World');
        innerNode1.appendChild(text1);
        innerNode2.appendChild(text2);
        outerNode.appendChild(innerNode1);
        outerNode.appendChild(innerNode2);
        root.appendChild(outerNode);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          marginTop: 1,
          paddingLeft: 1,
          paddingRight: 1,
        });

        root.children[0].children[0].setLayoutProps({
          marginLeft: 1,
          marginTop: 1,
          marginRight: 1,
          marginBottom: 1,
        });

        root.children[0].children[1].setLayoutProps({
          paddingLeft: 1,
          paddingTop: 1,
          paddingRight: 1,
          paddingBottom: 1,
        });

        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with height constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 1 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [text, node -> text, text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerNode = new Node();
        const innerNode = new Node();
        const text1 = new Text();
        const text2 = new Text();
        const text3 = new Text();

        text1.setBody('Brave');
        text2.setBody('New');
        text3.setBody('World');
        innerNode.appendChild(text2);
        outerNode.appendChild(text1);
        outerNode.appendChild(innerNode);
        outerNode.appendChild(text3);
        root.appendChild(outerNode);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].setLayoutProps({
          marginTop: 1,
          marginLeft: 1,
          marginRight: 1,
        });

        root.children[0].children[1].setLayoutProps({
          paddingLeft: 2,
          paddingTop: 1,
          paddingRight: 2,
          paddingBottom: 1,
        });

        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with outer height constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 2 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with inner height constrain', () => {
        const root = getTree();
        root.children[0].children[1].setLayoutProps({ height: 2 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [node -> text, text, node -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerNode = new Node();
        const innerNode1 = new Node();
        const innerNode2 = new Node();
        const text1 = new Text();
        const text2 = new Text();
        const text3 = new Text();

        text1.setBody('Brave');
        text2.setBody('New');
        text3.setBody('World');
        innerNode1.appendChild(text1);
        innerNode2.appendChild(text3);
        outerNode.appendChild(innerNode1);
        outerNode.appendChild(text2);
        outerNode.appendChild(innerNode2);
        root.appendChild(outerNode);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with layout props', () => {
        const root = getTree();

        root.children[0].children[0].setLayoutProps({
          paddingTop: 1,
          paddingBottom: 1,
        });

        root.children[0].children[2].setLayoutProps({
          marginTop: 1,
          marginBottom: 1,
        });

        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with height constrains', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 3 });
        root.children[0].children[0].setLayoutProps({ height: 2 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [node -> text, text, node -> [text, text]]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerNode = new Node();

        const node1 = new Node();
        const text1 = new Text();
        node1.appendChild(text1);
        text1.setBody('Text1');

        const text2 = new Text();
        text2.setBody('Text2');

        const node2 = new Node();
        const text3 = new Text();
        const text4 = new Text();
        text3.setBody('Text3');
        text4.setBody('Text4');
        node2.appendChild(text3);
        node2.appendChild(text4);

        outerNode.appendChild(node1);
        outerNode.appendChild(text2);
        outerNode.appendChild(node2);

        root.appendChild(outerNode);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });
  });

  describe('should align text', () => {
    function getTree() {
      const root = new Root({ width: 20, height: 10 });
      const node = new Node();
      const text = new Text();

      text.setBody('Hello');
      node.appendChild(text);
      root.appendChild(node);

      return root;
    }

    it('to the left', () => {
      const root = getTree();
      root.children[0].setLayoutProps({ width: 9 });
      root.children[0].setStyleProps({ textAlign: 'left' });
      const { renderElements } = root.calculateLayout();
      expect(renderElements[0].body.value).toEqual('Hello');
    });

    it('to the right', () => {
      const root = getTree();
      root.children[0].setLayoutProps({ width: 9 });
      root.children[0].setStyleProps({ textAlign: 'right' });
      const { renderElements } = root.calculateLayout();
      expect(renderElements[0].body.value).toEqual('    Hello');
    });

    it('center', () => {
      const root = getTree();
      root.children[0].setLayoutProps({ width: 9 });
      root.children[0].setStyleProps({ textAlign: 'center' });
      const { renderElements } = root.calculateLayout();
      expect(renderElements[0].body.value).toEqual('  Hello  ');
    });
  });

  describe('with border', () => {
    describe('for node(border) -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const node = new Node();
        const text = new Text();

        text.setBody('Hello World');
        node.appendChild(text);
        node.setBorder({ thickness: 'single-line' });
        root.appendChild(node);

        return root;
      }

      it('without layout/style props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width and heigh constrains', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 15, height: 3 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for node -> [text, node(border,inline) -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const node1 = new Node();
        const node2 = new Node();
        const text1 = new Text();
        const text2 = new Text();

        text1.setBody('Hmm');
        text2.setBody('Hello World');
        node2.appendChild(text2);
        node2.setLayoutProps({ display: 'inline' });
        node2.setBorder({ thickness: 'single-line' });
        node1.appendChild(text1);
        node1.appendChild(node2);
        root.appendChild(node1);

        return root;
      }

      it('without layout/style props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getJsonTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });
  });
});
