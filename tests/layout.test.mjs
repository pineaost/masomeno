import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
const desktopBreakpoint = '@media (min-width: 840px) {';
const start = css.indexOf(desktopBreakpoint);
const mobile = css.slice(0, start);
const desktop = css.slice(start + desktopBreakpoint.length, css.indexOf('\n}', start));

function rule(styles, selector) {
  const declarations = [...styles.matchAll(/^\s*([^{}\n]+?)\s*\{([^{}]*)\}/gm)]
    .filter(([, selectors]) => selectors.split(',').map((value) => value.trim()).includes(selector))
    .map(([, , body]) => body);
  assert.ok(declarations.length, `Falta la regla ${selector}`);
  return declarations.join(' ');
}

test('la navegación inferior cambia a sidebar a partir de 840 px', () => {
  assert.ok(start > 0, 'Falta el breakpoint de escritorio');
  assert.match(rule(mobile, '.main-nav'), /position:\s*fixed/);
  assert.match(rule(mobile, '.sidebar-bottom'), /display:\s*none/);
  assert.match(rule(desktop, '.shell'), /grid-template-columns:/);
  assert.match(rule(desktop, '.main-nav'), /position:\s*static/);
  assert.match(rule(desktop, '.sidebar-bottom'), /display:\s*grid/);
  assert.match(rule(desktop, '.shell-sidebar .mobile-account-trigger'), /display:\s*none/);
  assert.match(rule(desktop, '.mobile-sign-out'), /display:\s*none/);
});

test('Gym muestra Cinta primero en móvil y Ejercicios a la izquierda en escritorio', () => {
  assert.match(rule(mobile, '.gym-overview'), /grid-template-areas:\s*'treadmill'\s+'exercises'/);
  assert.match(rule(mobile, '.gym-overview > .treadmill'), /grid-area:\s*treadmill/);
  assert.match(rule(mobile, '.gym-overview > .gym-exercises'), /grid-area:\s*exercises/);
  assert.match(rule(desktop, '.gym-overview'), /grid-template-areas:\s*'exercises treadmill'/);
  assert.match(rule(desktop, '.gym-overview'), /grid-template-columns:/);
});
