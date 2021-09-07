describe('.env.local', () => {
  test('ensure REDIS_URL is set', async () => {
    expect(process.env['REDIS_URL']).toBeDefined();
  });
  test('ensure FALLBACK_URL is set', async () => {
    expect(process.env['FALLBACK_URL']).toBeDefined();
  });
});

export {};
