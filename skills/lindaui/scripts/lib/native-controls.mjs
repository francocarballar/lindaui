import { packageNames, resolveEntry, walk } from './project.mjs';

const entries = { button: 'button', textarea: 'textarea', select: 'select', option: 'select', a: 'link', details: 'disclosure', summary: 'disclosure', dialog: 'dialog', table: 'table' };
const inputEntries = { text: 'input', email: 'input', password: 'input', tel: 'input', url: 'input', checkbox: 'checkbox', radio: 'radio', search: 'search-field', number: 'number-input', range: 'slider', button: 'button', submit: 'button', reset: 'button' };
const testPath = /(?:^|\/)(?:tests?|__tests__|e2e|fixtures?|__fixtures__)(?:\/|$)|\.(?:test|spec|stories)\.[cm]?[jt]sx?$/;

export function nativeScope(context, file) {
  if (packageNames.includes(context.manifest.name)) return 'library-authoring';
  if (testPath.test(file.relative)) return 'test-fixture-or-story';
  return null;
}

function literal(attribute) {
  const value = attribute?.value;
  if (value?.type === 'StringLiteral') return value.value;
  if (value?.type === 'JSXExpressionContainer' && value.expression.type === 'StringLiteral') return value.expression.value;
  return null;
}

// A JSX comment authorizes exactly the next sibling element, across whitespace
// only. It cannot authorize a fragment, expression, subtree or another sibling.
function allowances(tree) {
  const allowed = new WeakMap();
  walk(tree, node => {
    if (!['JSXElement', 'JSXFragment'].includes(node.type)) return;
    let reason = null;
    for (const child of node.children) {
      if (child.type === 'JSXText' && !child.value.trim()) continue;
      if (reason && child.type === 'JSXElement') allowed.set(child.openingElement, reason);
      reason = null;
      if (child.type !== 'JSXExpressionContainer' || child.expression.type !== 'JSXEmptyExpression') continue;
      const comments = child.expression.innerComments ?? [];
      if (comments.length !== 1) continue;
      const match = comments[0].value.trim().match(/^lindaui-allow-native:\s*(\S[\s\S]*)$/);
      if (match) reason = match[1].trim();
    }
  });
  return allowed;
}

export function inspectNativeControls(context, file, tree) {
  const findings = []; const exceptions = []; const unmapped = [];
  const excluded = nativeScope(context, file);
  if (excluded) return { findings, exceptions, unmapped, excluded };
  const allowed = allowances(tree); const parents = new WeakMap(); const openings = [];
  walk(tree, (node, parent) => {
    if (parent) parents.set(node, parent);
    if (node.type === 'JSXOpeningElement' && node.name.type === 'JSXIdentifier') openings.push(node);
  });
  function within(node, name) {
    // Skip the element owning this opening; inspect enclosing elements only.
    let parent = parents.get(parents.get(node));
    while (parent) {
      if (parent.type === 'JSXElement' && parent.openingElement.name.type === 'JSXIdentifier' && parent.openingElement.name.name === name) return true;
      parent = parents.get(parent);
    }
    return false;
  }
  for (const node of openings) {
    const element = node.name.name;
    if (element !== 'input' && !Object.hasOwn(entries, element)) continue;
    const attrs = new Map(node.attributes.filter(a => a.type === 'JSXAttribute').map(a => [a.name.name, a]));
    if (element === 'a' && !attrs.has('href')) continue;
    if ((element === 'option' && within(node, 'select')) || (element === 'summary' && within(node, 'details'))) continue;
    const line = node.loc.start.line;
    let candidates; let severity = 'error';
    if (element === 'input') {
      const typeAttribute = attrs.get('type');
      const typeIndex = node.attributes.indexOf(typeAttribute);
      const spreadCanOverride = node.attributes.some((a, index) => a.type === 'JSXSpreadAttribute' && index > typeIndex);
      const type = spreadCanOverride ? null : typeAttribute ? literal(typeAttribute) : 'text';
      if (type === null) {
        candidates = [...new Set(Object.values(inputEntries))]; severity = 'warning';
      } else if (Object.hasOwn(inputEntries, type.toLowerCase())) candidates = [inputEntries[type.toLowerCase()]];
      else { unmapped.push({ file: file.relative, line, element, type, reason: 'No equivalent native-input contract in this rule; review the installed API.' }); continue; }
    } else candidates = [entries[element]];
    const info = context.packages['@lindaui/ui'];
    const suggestions = candidates.filter(entry => info && resolveEntry(info, `./${entry}`)).map(entry => `@lindaui/ui/${entry}`);
    if (!suggestions.length) continue;
    const reason = allowed.get(node);
    if (reason) { exceptions.push({ file: file.relative, line, element, reason, suggestions }); continue; }
    const suggestion = suggestions.join(' or ');
    const detail = element === 'table' ? ' Table uses grid semantics; preserve required table semantics with a justified local exception.' : severity === 'warning' ? ' The input type is dynamic or spread; choose by its runtime role.' : '';
    findings.push({ code: 'NATIVE_CONTROL', severity, file: file.relative, line, element, suggestion,
      message: `Native <${element}>: use ${suggestion}, reading its installed contract.${detail} If native HTML is required, add an adjacent {/* lindaui-allow-native: reason */} comment.` });
  }
  return { findings, exceptions, unmapped, excluded: null };
}
