import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createTranslator } from 'next-intl';
import ts from 'typescript';
import { locales } from '../src/i18n/config.ts';
import { createLocaleHandoff } from '../src/i18n/locale-handoff.ts';
import { localizedText, localizedValue } from '../src/i18n/localized-text.ts';
import { brandName } from '../src/lib/brand.ts';
import { settingsBackPath, settingsPath } from '../src/lib/settings-paths.ts';
import { heightInCentimeters, heightInFeetAndInches } from '../src/lib/units.ts';

function readCatalog(locale) {
  const source = readFileSync(new URL('../src/i18n/' + locale + '.json', import.meta.url), 'utf8');
  const ast = ts.parseJsonText(locale + '.json', source);
  const keys = new Map();
  function visit(object, prefix = '') {
    const names = new Set();
    for (const property of object.properties) {
      const name = property.name.text;
      const key = prefix + name;
      assert.ok(!names.has(name), locale + ' duplicates ' + key);
      names.add(name);
      if (ts.isObjectLiteralExpression(property.initializer)) visit(property.initializer, key + '.');
      else {
        assert.ok(ts.isStringLiteral(property.initializer), locale + ' ' + key + ' must be text');
        assert.ok(property.initializer.text.trim(), locale + ' ' + key + ' is empty');
        keys.set(key, property.initializer.text);
      }
    }
  }
  visit(ast.statements[0].expression);
  return { keys, messages: JSON.parse(source) };
}

const sharedWording = new Set([
  'nav.gym', 'meals.dinner', 'weight.weightInput', 'gym.leg', 'gym.chest', 'gym.pace', 'auth.password',
  'nutrition.raw', 'nutrition.food', 'nutrition.per100', 'nutrition.lineEstimate',
  'recipes.medium', 'recipes.minutes', 'settings.account',
]);

const argumentsFor = (text) => [...new Set(Array.from(text.matchAll(/\{([a-z][a-z0-9]*)(?:[,}])/gi), (match) => match[1]))].sort();

test('los catálogos tienen claves únicas, textos completos y parámetros ICU equivalentes', () => {
  const catalogs = locales.map(readCatalog);
  for (const [index, { keys, messages }] of catalogs.entries()) {
    const locale = locales[index];
    const t = createTranslator({ locale, messages, onError: (error) => { throw error; } });
    assert.deepEqual([...keys.keys()].sort(), [...catalogs[0].keys.keys()].sort(), locale);
    for (const [key, value] of keys) {
      const parameters = argumentsFor(value);
      assert.deepEqual(parameters, argumentsFor(catalogs[0].keys.get(key)), locale + ' ' + key);
      const variables = Object.fromEntries(parameters.map((name) => [name, 2]));
      assert.notEqual(t(key, variables), key, locale + ' ' + key);
      for (const previous of catalogs.slice(0, index)) {
        if (!sharedWording.has(key)) assert.notEqual(value, previous.keys.get(key), locale + ' duplicates ' + key);
      }
    }
  }
});

test('los datos estructurados priorizan el idioma elegido y usan un texto alternativo disponible', () => {
  const names = { es: ' Queso cremoso Ricrem ', en: 'Ricrem cheese', it: ' ' };
  assert.equal(localizedText(names, 'en'), 'Ricrem cheese');
  assert.deepEqual(localizedValue(names, 'it'), { text: 'Queso cremoso Ricrem', language: 'es' });
  assert.equal(localizedText({ en: 'Test recipe' }, 'it'), 'Test recipe');
  assert.equal(localizedText({ es: ' ' }, 'en'), undefined);
  assert.equal(brandName, 'Masomeno');
});

test('al cambiar de idioma Configuración conserva el destino local y el filtro válido', () => {
  const from = '/es/comidas/recetario?intensidad=extraHearty';
  const switched = new URL(settingsPath('it', from), 'http://localhost');
  assert.equal(switched.pathname, '/it/configuracion');
  assert.equal(switched.searchParams.get('volver'), '/it/comidas/recetario?intensidad=extraHearty');
  assert.equal(settingsBackPath('en', switched.searchParams.get('volver')), '/en/comidas/recetario?intensidad=extraHearty');
  assert.equal(settingsBackPath('en', '/it/comidas/recetario?intensidad=no-existe'), '/en/comidas/recetario');
  for (const unsafe of ['/es/login', '/es/../en', '//example.invalid', 'https://example.invalid/', '/es/gym/ejercicios/no-id']) {
    assert.equal(settingsBackPath('en', unsafe), '/en');
  }
});

test('el borrador solo se recupera en la URL de destino y se borra al entrar', () => {
  const handoff = createLocaleHandoff();
  const destination = settingsPath('it', '/es/gym');
  handoff.prepare(destination, { display_name: 'Nombre personal' });
  assert.equal(handoff.read(settingsPath('en', '/es/gym')), undefined);
  assert.deepEqual(handoff.read(destination), { display_name: 'Nombre personal' });
  handoff.clear(destination);
  assert.equal(handoff.read(destination), undefined);
});

test('la presentación imperial usa pies y pulgadas y calcula centímetros al editar', () => {
  assert.deepEqual(heightInFeetAndInches(175, 2), { feet: 5, inches: 8.9 });
  assert.equal(heightInCentimeters(5, 9).toFixed(2), '175.26');
});

