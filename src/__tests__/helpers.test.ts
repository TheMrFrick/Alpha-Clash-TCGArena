/**
 * Alpha Clash TCG - Helper Functions Unit Tests
 */

import {
  generateId,
  throttle,
  debounce,
  clamp,
  shuffle,
  deepClone,
  isDefined,
  capitalize,
  toKebabCase,
  randomElement,
  unique,
  groupBy,
  setDebugMode,
  isDebugEnabled,
  debug,
} from '../utils/helpers';

describe('Helper Functions', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('should use default prefix', () => {
      const id = generateId();
      expect(id.startsWith('ac-')).toBe(true);
    });

    it('should use custom prefix', () => {
      const id = generateId('custom');
      expect(id.startsWith('custom-')).toBe(true);
    });

    it('should generate IDs of reasonable length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(40);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call function immediately first time', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not call function again within limit', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function again after limit', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled();
      jest.advanceTimersByTime(100);
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to function', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled('arg1', 'arg2');

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not call function immediately', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();

      expect(fn).not.toHaveBeenCalled();
    });

    it('should call function after wait time', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(50);
      debounced();
      jest.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to function', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('clamp', () => {
    it('should return value if within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should clamp to min if below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should clamp to max if above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10);
    });
  });

  describe('shuffle', () => {
    it('should return array of same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);

      expect(shuffled).toHaveLength(5);
    });

    it('should contain same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);

      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should not modify original array', () => {
      const arr = [1, 2, 3, 4, 5];
      shuffle(arr);

      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('should handle single element', () => {
      expect(shuffle([1])).toEqual([1]);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(5)).toBe(5);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(null)).toBe(null);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, 3];
      const cloned = deepClone(arr);

      expect(cloned).toEqual([1, 2, 3]);
      expect(cloned).not.toBe(arr);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);

      expect(cloned).toEqual({ a: 1, b: 2 });
      expect(cloned).not.toBe(obj);
    });

    it('should deep clone nested objects', () => {
      const obj = { a: { b: { c: 1 } } };
      const cloned = deepClone(obj);

      expect(cloned.a.b.c).toBe(1);
      expect(cloned.a).not.toBe(obj.a);
      expect(cloned.a.b).not.toBe(obj.a.b);
    });

    it('should not clone functions', () => {
      // JSON.stringify ignores functions
      const obj = { fn: () => {} };
      const cloned = deepClone(obj);

      expect(cloned.fn).toBeUndefined();
    });
  });

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
    });

    it('should return false for null', () => {
      expect(isDefined(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should only capitalize first letter', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
    });
  });

  describe('toKebabCase', () => {
    it('should convert camelCase', () => {
      expect(toKebabCase('camelCase')).toBe('camel-case');
    });

    it('should convert PascalCase', () => {
      expect(toKebabCase('PascalCase')).toBe('pascal-case');
    });

    it('should convert spaces', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
    });

    it('should convert underscores', () => {
      expect(toKebabCase('hello_world')).toBe('hello-world');
    });

    it('should handle already kebab-case', () => {
      expect(toKebabCase('kebab-case')).toBe('kebab-case');
    });
  });

  describe('randomElement', () => {
    it('should return element from array', () => {
      const arr = [1, 2, 3];
      const result = randomElement(arr);

      expect(arr).toContain(result);
    });

    it('should return undefined for empty array', () => {
      expect(randomElement([])).toBeUndefined();
    });

    it('should return only element for single-element array', () => {
      expect(randomElement([42])).toBe(42);
    });
  });

  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });

    it('should handle no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should work with strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];

      const grouped = groupBy(items, (item) => item.type);

      expect(grouped['a']).toHaveLength(2);
      expect(grouped['b']).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const grouped = groupBy([], () => 'key');
      expect(grouped).toEqual({});
    });

    it('should work with number keys', () => {
      const items = [
        { score: 1 },
        { score: 2 },
        { score: 1 },
      ];

      const grouped = groupBy(items, (item) => item.score);

      expect(grouped[1]).toHaveLength(2);
      expect(grouped[2]).toHaveLength(1);
    });
  });

  describe('debug mode', () => {
    const originalLog = console.log;

    beforeEach(() => {
      console.log = jest.fn();
    });

    afterEach(() => {
      console.log = originalLog;
      setDebugMode(false);
    });

    it('should be disabled by default', () => {
      expect(isDebugEnabled()).toBe(false);
    });

    it('should enable debug mode', () => {
      setDebugMode(true);
      expect(isDebugEnabled()).toBe(true);
    });

    it('should disable debug mode', () => {
      setDebugMode(true);
      setDebugMode(false);
      expect(isDebugEnabled()).toBe(false);
    });

    it('should not log when disabled', () => {
      setDebugMode(false);
      debug('test message');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log when enabled', () => {
      setDebugMode(true);
      debug('test message');

      expect(console.log).toHaveBeenCalledWith('[Alpha Clash]', 'test message');
    });
  });
});
