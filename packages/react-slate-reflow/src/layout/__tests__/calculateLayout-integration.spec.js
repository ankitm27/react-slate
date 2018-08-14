import Root from '../../nodes/Root';
import View from '../../nodes/View';
import Text from '../../nodes/Text';

describe('calculateLayout integration suite', () => {
  describe('should calculate layout', () => {
    describe('for view -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const view = new View();
        const text = new Text();

        text.setBody('Hello World');
        view.appendChild(text);
        root.appendChild(view);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> view -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerView = new View();
        const innerView = new View();
        const text = new Text();

        text.setBody('Hello World');
        innerView.appendChild(text);
        outerView.appendChild(innerView);
        root.appendChild(outerView);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width top-level constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrains', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        root.children[0].children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrains and overflow', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 5 });
        root.children[0].children[0].setLayoutProps({ width: 7 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [text, text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const view = new View();
        const text1 = new Text();
        const text2 = new Text();

        text1.setBody('Hello');
        text2.setBody(' World');
        view.appendChild(text1);
        view.appendChild(text2);
        root.appendChild(view);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [text, view(inline) -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const view = new View();
        const text1 = new Text();
        const innerView = new View();
        const text2 = new Text();

        innerView.setLayoutProps({
          display: 'inline',
        });

        text1.setBody('Hello');
        text2.setBody(' World');
        innerView.appendChild(text2);
        view.appendChild(text1);
        view.appendChild(innerView);
        root.appendChild(view);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [text, view -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerView = new View();
        const text = new Text();
        const innerView = new View();
        const innerText = new Text();

        text.setBody('Hello');
        innerText.setBody('World');
        innerView.appendChild(innerText);
        outerView.appendChild(text);
        outerView.appendChild(innerView);
        root.appendChild(outerView);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with non-altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [view -> text, text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerView = new View();
        const text = new Text();
        const innerView = new View();
        const innerText = new Text();

        text.setBody('World');
        innerText.setBody('Hello');
        innerView.appendChild(innerText);
        outerView.appendChild(innerView);
        outerView.appendChild(text);
        root.appendChild(outerView);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with non-altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 8 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with altering width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with height constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 1 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [view -> text, view -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerView = new View();
        const innerView1 = new View();
        const text1 = new Text();
        const innerView2 = new View();
        const text2 = new Text();

        text1.setBody('Hello');
        text2.setBody('World');
        innerView1.appendChild(text1);
        innerView2.appendChild(text2);
        outerView.appendChild(innerView1);
        outerView.appendChild(innerView2);
        root.appendChild(outerView);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with height constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 1 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [text, view -> text, text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerView = new View();
        const innerView = new View();
        const text1 = new Text();
        const text2 = new Text();
        const text3 = new Text();

        text1.setBody('Brave');
        text2.setBody('New');
        text3.setBody('World');
        innerView.appendChild(text2);
        outerView.appendChild(text1);
        outerView.appendChild(innerView);
        outerView.appendChild(text3);
        root.appendChild(outerView);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with outer height constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 2 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with inner height constrain', () => {
        const root = getTree();
        root.children[0].children[1].setLayoutProps({ height: 2 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [view -> text, text, view -> text]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerView = new View();
        const innerView1 = new View();
        const innerView2 = new View();
        const text1 = new Text();
        const text2 = new Text();
        const text3 = new Text();

        text1.setBody('Brave');
        text2.setBody('New');
        text3.setBody('World');
        innerView1.appendChild(text1);
        innerView2.appendChild(text3);
        outerView.appendChild(innerView1);
        outerView.appendChild(text2);
        outerView.appendChild(innerView2);
        root.appendChild(outerView);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
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
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with height constrains', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ height: 3 });
        root.children[0].children[0].setLayoutProps({ height: 2 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [view -> text, text, view -> [text, text]]', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const outerView = new View();

        const view1 = new View();
        const text1 = new Text();
        view1.appendChild(text1);
        text1.setBody('Text1');

        const text2 = new Text();
        text2.setBody('Text2');

        const view2 = new View();
        const text3 = new Text();
        const text4 = new Text();
        text3.setBody('Text3');
        text4.setBody('Text4');
        view2.appendChild(text3);
        view2.appendChild(text4);

        outerView.appendChild(view1);
        outerView.appendChild(text2);
        outerView.appendChild(view2);

        root.appendChild(outerView);

        return root;
      }

      it('without style/layout props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width constrain', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 4 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });
  });

  describe('should align text', () => {
    function getTree() {
      const root = new Root({ width: 20, height: 10 });
      const view = new View();
      const text = new Text();

      text.setBody('Hello');
      view.appendChild(text);
      root.appendChild(view);

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
    describe('for view(border) -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const view = new View();
        const text = new Text();

        text.setBody('Hello World');
        view.appendChild(text);
        view.setBorder({ thickness: 'single-line' });
        root.appendChild(view);

        return root;
      }

      it('without layout/style props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });

      it('with width and heigh constrains', () => {
        const root = getTree();
        root.children[0].setLayoutProps({ width: 15, height: 3 });
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });

    describe('for view -> [text, view(border,inline) -> text', () => {
      function getTree() {
        const root = new Root({ width: 20, height: 10 });
        const view1 = new View();
        const view2 = new View();
        const text1 = new Text();
        const text2 = new Text();

        text1.setBody('Hmm');
        text2.setBody('Hello World');
        view2.appendChild(text2);
        view2.setLayoutProps({ display: 'inline' });
        view2.setBorder({ thickness: 'single-line' });
        view1.appendChild(text1);
        view1.appendChild(view2);
        root.appendChild(view1);

        return root;
      }

      it('without layout/style props', () => {
        const root = getTree();
        const { layoutTree, renderElements } = root.calculateLayout();
        expect(layoutTree.getLayoutTree()).toMatchSnapshot();
        expect(renderElements).toMatchSnapshot();
      });
    });
  });
});
