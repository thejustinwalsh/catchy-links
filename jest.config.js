module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./tests/.setup.js'],
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.+(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^data/(.*)': '<rootDir>/data/$1',
    '^lib/(.*)': '<rootDir>/lib/$1',
  },
};
