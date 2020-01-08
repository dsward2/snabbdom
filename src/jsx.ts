import { vnode, VNode, VNodeData } from './vnode';
import { h, ArrayOrElement } from './h';

// for conditional rendering we support boolean child element e.g cond && <tag />
export type JsxVNodeChild = VNode | string | number | boolean | undefined | null;
export type JsxVNodeChildren = ArrayOrElement<JsxVNodeChild>
export type JsxVNodeProps = VNodeData & {sel?: string};
export type FunctionComponent = (props: {[prop: string]: any} | null, children?: VNode[]) => VNode;

function flattenAndFilter (children: JsxVNodeChildren[], flattened: VNode[]): VNode[] {
  for (const child of children) {
    // filter out falsey children, except 0 since zero can be a valid value e.g inside a chart
    if (child !== undefined && child !== null && child !== false && child !== '') {
      if (Array.isArray(child)) {
        flattenAndFilter(child, flattened);
      } else if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
        flattened.push(vnode(undefined, undefined, undefined, String(child), undefined));
      } else {
        flattened.push(child);
      }
    }
  }
  return flattened;
}

/**
 * jsx/tsx compatible factory function
 * see: https://www.typescriptlang.org/docs/handbook/jsx.html#factory-functions
 */
export function jsx (tag: string | FunctionComponent, props: JsxVNodeProps | null, ...children: JsxVNodeChildren[]): VNode {
  const flatChildren = flattenAndFilter(children, []);
  if (typeof tag === 'function') {
    // tag is a function component
    return tag(props, flatChildren);
  } else {
    // append sel css selector to tag to support equivalent of h('span.foo.bar')
    if (props && props.sel) {
      tag += props.sel;
    }
    if (flatChildren.length == 1 && !flatChildren[0].sel && flatChildren[0].text) {
      // only child is a simple text node, pass as text for a simpler vtree
      return h(tag, props, flatChildren[0].text);
    } else {
      return h(tag, props, flatChildren);
    }
  }
}
