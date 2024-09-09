export const roots = ['<rootDir>/src'];
export const transform = {
  '^.+\\.ts?$': 'ts-jest',
};
export const testRegex = '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$';
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];