import { test, expect } from '@playwright/test';

/**
 * A3 — API Test Suite
 * Target  : POST https://jsonplaceholder.typicode.com/posts
 * Objective: Validate API behaviour with boundary and invalid data
 *
 * NOTE: JSONPlaceholder is a public mock/fake REST API.
 *       It intentionally returns HTTP 201 for ALL inputs — valid or not.
 *       Tests document:
 *         (a) what the mock API actually returns  → asserted
 *         (b) what a real production API should return → noted in comments
 */

const ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Excessively long strings
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Boundary Test — Excessively long strings', () => {

  test('TC-A3-01: title with 10,000 characters', async ({ request }) => {
    const longTitle = 'A'.repeat(10_000);

    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: longTitle,
        body: 'Normal body content',
      },
    });

    // Mock returns 201 — real API should return 400 Bad Request
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');           // response has an id
    expect(json.title).toBe(longTitle);          // mock echoes back what we sent
    expect(json.userId).toBe(1);

    console.log(`TC-A3-01 | Status: ${response.status()} | ID: ${json.id} | Title length: ${json.title.length}`);
  });

  test('TC-A3-02: body with 50,000 characters', async ({ request }) => {
    const longBody = 'B'.repeat(50_000);

    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: 'Normal title',
        body: longBody,
      },
    });

    // Mock returns 201 — real API should return 413 Payload Too Large
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');
    expect(json.body).toBe(longBody);

    console.log(`TC-A3-02 | Status: ${response.status()} | Body length: ${json.body.length}`);
  });

  test('TC-A3-03: all fields with maximum length strings', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 999999999,
        title: 'T'.repeat(5_000),
        body:  'B'.repeat(5_000),
      },
    });

    // Mock returns 201 — real API should return 400 or 413
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-03 | Status: ${response.status()} | ID: ${json.id}`);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — Unsupported special characters
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Boundary Test — Unsupported special characters', () => {

  test('TC-A3-04: XSS script injection in title', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: '<script>alert("xss")</script>',
        body:  'Body content',
      },
    });

    // Mock returns 201 — real API should sanitize or return 400
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-04 | Status: ${response.status()} | Title: ${json.title}`);
  });

  test('TC-A3-05: SQL injection characters in title', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: "'; DROP TABLE posts; --",
        body:  'Body content',
      },
    });

    // Mock returns 201 — real API should sanitize or return 400
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-05 | Status: ${response.status()} | Title: ${json.title}`);
  });

  test('TC-A3-06: null bytes and control characters', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: 'Title\x00with\x01null\x1Fbytes',
        body:  'Body\x00content',
      },
    });

    // Mock returns 201 — real API should return 400 Bad Request
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-06 | Status: ${response.status()} | ID: ${json.id}`);
  });

  test('TC-A3-07: emoji and unicode characters', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: '🔥💀 Unicode title 中文 العربية',
        body:  '🎉 Body with emoji 🚀',
      },
    });

    // Mock returns 201 — real API may or may not accept unicode
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-07 | Status: ${response.status()} | Title: ${json.title}`);
  });

  test('TC-A3-08: special characters — brackets, pipes, backslashes', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: '{}[]|\\^~`<>',
        body:  'Special chars: @#$%^&*()',
      },
    });

    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-08 | Status: ${response.status()} | Title: ${json.title}`);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — Missing required fields
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Boundary Test — Missing required fields', () => {

  test('TC-A3-09: missing userId field', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        title: 'Post without userId',
        body:  'This post has no userId',
      },
    });

    // Mock returns 201 — real API should return 422 Unprocessable Entity
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');
    expect(json).not.toHaveProperty('userId'); // userId was not sent

    console.log(`TC-A3-09 | Status: ${response.status()} | Has userId: ${'userId' in json}`);
  });

  test('TC-A3-10: missing title field', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        body: 'Post without a title',
      },
    });

    // Mock returns 201 — real API should return 422
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-10 | Status: ${response.status()} | Has title: ${'title' in json}`);
  });

  test('TC-A3-11: missing body field', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title: 'Post without a body',
      },
    });

    // Mock returns 201 — real API should return 422
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-11 | Status: ${response.status()} | Has body: ${'body' in json}`);
  });

  test('TC-A3-12: completely empty request body', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {},
    });

    // Mock returns 201 — real API should return 400 Bad Request
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-12 | Status: ${response.status()} | Response: ${JSON.stringify(json)}`);
  });

  test('TC-A3-13: null values for all fields', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: null,
        title:  null,
        body:   null,
      },
    });

    // Mock returns 201 — real API should return 400
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-13 | Status: ${response.status()} | Response: ${JSON.stringify(json)}`);
  });

  test('TC-A3-14: wrong data types — strings where numbers expected', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 'not-a-number',
        title:  12345,           // number instead of string
        body:   true,            // boolean instead of string
      },
    });

    // Mock returns 201 — real API should return 400 Bad Request
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-14 | Status: ${response.status()} | userId: ${json.userId} | title: ${json.title}`);
  });

  test('TC-A3-15: negative userId value', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: -1,
        title:  'Post with negative userId',
        body:   'Testing boundary on userId',
      },
    });

    // Mock returns 201 — real API should return 400 or 422
    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');

    console.log(`TC-A3-15 | Status: ${response.status()} | userId: ${json.userId}`);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — Valid baseline (sanity check)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Baseline — Valid request sanity check', () => {

  test('TC-A3-16: valid request returns 201 with correct response shape', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        userId: 1,
        title:  'Valid post title',
        body:   'Valid post body content',
      },
    });

    expect(response.status()).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('id');
    expect(json.userId).toBe(1);
    expect(json.title).toBe('Valid post title');
    expect(json.body).toBe('Valid post body content');
    expect(typeof json.id).toBe('number');

    console.log(`TC-A3-16 | Status: ${response.status()} | ID: ${json.id} ✅ Baseline passed`);
  });

});
