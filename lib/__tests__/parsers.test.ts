import { getSortingStateParser, getFiltersStateParser } from '../parsers';

jest.mock('nuqs', () => ({
  createParser: jest.fn(({ parse, serialize, eq }) => ({
    parse,
    serialize,
    eq,
  })),
}));

describe('parsers', () => {
  describe('getSortingStateParser', () => {
    const validColumnIds = new Set(['name', 'age']);
    const parser = getSortingStateParser(validColumnIds);

    it('parses valid sorting state', () => {
      const val = JSON.stringify([{ id: 'name', desc: true }]);
      expect(parser.parse(val)).toEqual([{ id: 'name', desc: true }]);
    });

    it('returns empty array for invalid column ids', () => {
      const val = JSON.stringify([{ id: 'invalid', desc: false }]);
      expect(parser.parse(val)).toEqual([]);
    });

    it('returns empty array on parse error', () => {
      expect(parser.parse('invalid json')).toEqual([]);
    });

    it('serializes valid sorting state', () => {
      const state = [{ id: 'age', desc: false }] as any;
      expect(parser.serialize(state)).toBe(JSON.stringify(state));
    });

    it('ignores invalid sorting state on serialize', () => {
      const state = [{ id: 'age', desc: false }, null, 'invalid'] as any;
      expect(parser.serialize(state)).toBe(JSON.stringify([{ id: 'age', desc: false }]));
    });

    it('checks equality correctly', () => {
      const a = [{ id: 'name', desc: true }] as any;
      const b = [{ id: 'name', desc: true }] as any;
      const c = [{ id: 'name', desc: false }] as any;
      expect(parser.eq(a, b)).toBe(true);
      expect(parser.eq(a, c)).toBe(false);
    });
  });

  describe('getFiltersStateParser', () => {
    const parser = getFiltersStateParser(new Set(['status', 'role']));

    it('parses valid filter state', () => {
      const filter = [{ id: 'status', value: 'active', variant: 'select', operator: 'eq', filterId: 'f1' }];
      expect(parser.parse(JSON.stringify(filter))).toEqual(filter);
    });

    it('returns null for invalid keys', () => {
      const filter = [{ id: 'invalid_key', value: 'active', variant: 'select', operator: 'eq', filterId: 'f1' }];
      expect(parser.parse(JSON.stringify(filter))).toBeNull();
    });

    it('returns null on invalid json', () => {
      expect(parser.parse('invalid')).toBeNull();
    });

    it('returns null if schema fails', () => {
      const filter = [{ id: 'status' }]; // Missing required fields
      expect(parser.parse(JSON.stringify(filter))).toBeNull();
    });

    it('serializes filter state correctly', () => {
      const filter = [{ id: 'status', value: 'active', variant: 'select', operator: 'eq', filterId: 'f1' }] as any;
      expect(parser.serialize(filter)).toBe(JSON.stringify(filter));
    });

    it('checks equality correctly', () => {
      const a = [{ id: 'status', value: 'active', variant: 'select', operator: 'eq', filterId: 'f1' }] as any;
      const b = [{ id: 'status', value: 'active', variant: 'select', operator: 'eq', filterId: 'f1' }] as any;
      const c = [{ id: 'status', value: 'inactive', variant: 'select', operator: 'eq', filterId: 'f1' }] as any;
      expect(parser.eq(a, b)).toBe(true);
      expect(parser.eq(a, c)).toBe(false);
    });
  });
});
