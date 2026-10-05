
# A3 — API Test Suite

> **Streamhub QA Automation Assessment — Section A3**
> Tool: Playwright Test | Target: JSONPlaceholder REST API

---

## Table of Contents

1. [Overview](#1-overview)
2. [Target API](#2-target-api)
3. [Test File Structure](#3-test-file-structure)
4. [Test Cases](#4-test-cases)
5. [Test Execution Results](#5-test-execution-results)
6. [Important Note on JSONPlaceholder](#6-important-note-on-jsonplaceholder)
7. [How to Run](#7-how-to-run)

---

## 1. Overview

This suite validates the `POST /posts` endpoint of JSONPlaceholder by sending boundary and invalid data — excessively long strings, unsupported special characters, and missing required fields — and asserting on the API's response.

**Total test cases: 16 | Result: 16 passed ✅**

---

## 2. Target API

| Property | Value |
|---|---|
| Endpoint | `POST https://jsonplaceholder.typicode.com/posts` |
| Auth | None required |
| Content-Type | `application/json` |
| Expected request shape | `{ userId, title, body }` |

**Valid request example:**

```json
{
  "userId": 1,
  "title": "My post title",
  "body": "My post body"
}
```

**Valid response example:**

```json
{
  "id": 101,
  "userId": 1,
  "title": "My post title",
  "body": "My post body"
}
```

---

## 3. Test File Structure

```
api-tests/
└── jsonplaceholder.spec.ts     # 16 test cases across 4 suites

test-results/
└── api/
    └── api-console-output.txt  # Full execution log — 16 passed
```

---

## 4. Test Cases

### Suite 1 — Excessively long strings (TC-A3-01 to TC-A3-03)

| TC | Input | Actual (mock) | Expected (production) |
|---|---|---|---|
| TC-A3-01 | Title = 10,000 characters | 201 + echoes title | 400 Bad Request |
| TC-A3-02 | Body = 50,000 characters | 201 + echoes body | 413 Payload Too Large |
| TC-A3-03 | All fields at max length | 201 | 400 or 413 |

### Suite 2 — Unsupported special characters (TC-A3-04 to TC-A3-08)

| TC | Input | Actual (mock) | Expected (production) |
|---|---|---|---|
| TC-A3-04 | XSS: `<script>alert("xss")</script>` in title | 201 + echoes as-is | 400 / sanitize |
| TC-A3-05 | SQL injection: `'; DROP TABLE posts; --` | 201 + echoes as-is | 400 / sanitize |
| TC-A3-06 | Null bytes + control chars (`\x00`, `\x01`) | 201 | 400 Bad Request |
| TC-A3-07 | Emoji + unicode (`🔥 中文 العربية`) | 201 | 201 (unicode valid) |
| TC-A3-08 | Special chars: `{}[]|\^~\`<>` | 201 | 400 or sanitize |

### Suite 3 — Missing required fields (TC-A3-09 to TC-A3-15)

| TC | Input | Actual (mock) | Expected (production) |
|---|---|---|---|
| TC-A3-09 | Missing `userId` | 201, no userId in response | 422 Unprocessable Entity |
| TC-A3-10 | Missing `title` | 201, no title in response | 422 Unprocessable Entity |
| TC-A3-11 | Missing `body` | 201, no body in response | 422 Unprocessable Entity |
| TC-A3-12 | Completely empty `{}` | 201, only `{id:101}` | 400 Bad Request |
| TC-A3-13 | All fields = `null` | 201 | 400 Bad Request |
| TC-A3-14 | Wrong types (string userId, number title) | 201, echoes as sent | 400 Bad Request |
| TC-A3-15 | Negative `userId` (-1) | 201 | 400 or 422 |

### Suite 4 — Baseline sanity check (TC-A3-16)

| TC | Input | Actual | Expected |
|---|---|---|---|
| TC-A3-16 | Valid `{ userId:1, title, body }` | 201, correct shape | 201 ✅ |

---

## 5. Test Execution Results

```
Running 16 tests using 1 worker

TC-A3-01 | Status: 201 | ID: 101 | Title length: 10000
  ✓   1  TC-A3-01: title with 10,000 characters                    (227ms)
TC-A3-02 | Status: 201 | Body length: 50000
  ✓   2  TC-A3-02: body with 50,000 characters                     (269ms)
TC-A3-03 | Status: 201 | ID: 101
  ✓   3  TC-A3-03: all fields with maximum length strings           (103ms)
TC-A3-04 | Status: 201 | Title: <script>alert("xss")</script>
  ✓   4  TC-A3-04: XSS script injection in title                   (204ms)
TC-A3-05 | Status: 201 | Title: '; DROP TABLE posts; --
  ✓   5  TC-A3-05: SQL injection characters in title               (103ms)
TC-A3-06 | Status: 201 | ID: 101
  ✓   6  TC-A3-06: null bytes and control characters               (219ms)
TC-A3-07 | Status: 201 | Title: 🔥💀 Unicode title 中文 العربية
  ✓   7  TC-A3-07: emoji and unicode characters                    (212ms)
TC-A3-08 | Status: 201 | Title: {}[]|\^~`<>
  ✓   8  TC-A3-08: special characters — brackets, pipes, backslash (154ms)
TC-A3-09 | Status: 201 | Has userId: false
  ✓   9  TC-A3-09: missing userId field                            (180ms)
TC-A3-10 | Status: 201 | Has title: false
  ✓  10  TC-A3-10: missing title field                             (184ms)
TC-A3-11 | Status: 201 | Has body: false
  ✓  11  TC-A3-11: missing body field                              (134ms)
TC-A3-12 | Status: 201 | Response: {"id":101}
  ✓  12  TC-A3-12: completely empty request body                   (171ms)
TC-A3-13 | Status: 201 | Response: {"userId":null,"title":null,...}
  ✓  13  TC-A3-13: null values for all fields                      (142ms)
TC-A3-14 | Status: 201 | userId: not-a-number | title: 12345
  ✓  14  TC-A3-14: wrong data types                                (156ms)
TC-A3-15 | Status: 201 | userId: -1
  ✓  15  TC-A3-15: negative userId value                           (88ms)
TC-A3-16 | Status: 201 | ID: 101 ✅ Baseline passed
  ✓  16  TC-A3-16: valid request — correct response shape          (140ms)

  16 passed (3.7s)
```

Full log: `test-results/api/api-console-output.txt`

---

## 6. Important Note on JSONPlaceholder

JSONPlaceholder is a **public mock/fake REST API** designed for testing and prototyping. It intentionally returns **HTTP 201** for every POST request regardless of the input — valid or malformed.

This is by design. The tests are written to:

1. **Assert on actual behaviour** — what the mock returns (`201`)
2. **Document expected production behaviour** — what a real validated API should return (noted in code comments)

This approach demonstrates genuine understanding of API testing principles while being honest about the mock's limitations.

```ts
// Example from the test file:
// Mock returns 201 — real API should return 400 Bad Request
expect(response.status()).toBe(201);
```

---

## 7. How to Run

### Prerequisites

```bash
node --version   # 18 or higher
npm --version
```

### Install dependencies

```bash
npm install
npx playwright install chromium
```

### Run only API tests

```bash
npx playwright test api-tests/
```

### Run with verbose output

```bash
npx playwright test api-tests/ --reporter=list
```

### Run all tests (UI + API)

```bash
npx playwright test
```

### Save output to file

```bash
npx playwright test api-tests/ --reporter=list 2>&1 | tee test-results/api/api-console-output.txt
```
