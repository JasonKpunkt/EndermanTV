import { getBlockAt, blockMap } from './main.js';

describe('getBlockAt', () => {
    beforeEach(() => {
        // Clear the blockMap before each test to ensure tests don't affect each other
        blockMap.clear();
    });

    test('should return true if block exists at exact coordinates', () => {
        blockMap.set('1,2,3', true);
        expect(getBlockAt(1, 2, 3)).toBe(true);
    });

    test('should return false if block does not exist at coordinates', () => {
        blockMap.set('1,2,3', true);
        expect(getBlockAt(4, 5, 6)).toBe(false);
    });

    test('should return true for floating point coordinates that round to existing block', () => {
        blockMap.set('1,2,3', true);
        expect(getBlockAt(1.4, 2.1, 2.9)).toBe(true);
        expect(getBlockAt(0.6, 1.8, 3.4)).toBe(true);
    });

    test('should handle negative coordinates', () => {
        blockMap.set('-1,-2,-3', true);
        expect(getBlockAt(-1, -2, -3)).toBe(true);
        expect(getBlockAt(-1.4, -2.1, -2.9)).toBe(true);
        expect(getBlockAt(-0.6, -1.8, -3.4)).toBe(true);
    });

    test('should return false for empty blockMap', () => {
        expect(getBlockAt(0, 0, 0)).toBe(false);
    });
});
