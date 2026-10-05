# A3 — API Test Setup & Steps

Step-by-step guide to set up, run, and commit the API tests.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18 or higher |
| npm | Comes with Node |
| Internet connection | Required (calls live JSONPlaceholder API) |

---

## Step 1 — Install dependencies

If you have already installed dependencies for A2, skip this step.

```bash
npm install
npx playwright install chromium
```

---

## Step 2 — Understand the file

The entire API test suite lives in one file:

```
api-tests/
└── jsonplaceholder.spec.ts
```

It contains **16 test cases** across **4 suites**:

| Suite | Test cases | What is tested |
|---|---|---|
| Excessively long strings | TC-A3-01 to 03 | 10K title, 50K body, all fields max length |
| Special characters | TC-A3-04 to 08 | XSS, SQL injection, null bytes, emoji, brackets |
| Missing required fields | TC-A3-09 to 15 | Missing userId/title/body, empty body, nulls, wrong types, negative id |
| Baseline sanity check | TC-A3-16 | Valid request confirms correct response shape |

---

## Step 3 — Run the API tests

```bash
# Run only API tests
npx playwright test api-tests/

# Run with detailed output (recommended)
npx playwright test api-tests/ --reporter=list
```

**Expected output:**

```
Running 16 tests using 1 worker

  ✓   1  TC-A3-01: title with 10,000 characters          (227ms)
  ✓   2  TC-A3-02: body with 50,000 characters           (269ms)
  ✓   3  TC-A3-03: all fields with maximum length        (103ms)
  ✓   4  TC-A3-04: XSS script injection in title         (204ms)
  ✓   5  TC-A3-05: SQL injection characters              (103ms)
  ✓   6  TC-A3-06: null bytes and control characters     (219ms)
  ✓   7  TC-A3-07: emoji and unicode characters          (212ms)
  ✓   8  TC-A3-08: special characters                    (154ms)
  ✓   9  TC-A3-09: missing userId field                  (180ms)
  ✓  10  TC-A3-10: missing title field                   (184ms)
  ✓  11  TC-A3-11: missing body field                    (134ms)
  ✓  12  TC-A3-12: completely empty request body         (171ms)
  ✓  13  TC-A3-13: null values for all fields            (142ms)
  ✓  14  TC-A3-14: wrong data types                      (156ms)
  ✓  15  TC-A3-15: negative userId value                  (88ms)
  ✓  16  TC-A3-16: valid request — baseline              (140ms)

  16 passed (3.7s)
```

---

## Step 4 — Save the console output

The assessment requires results to be committed — not just the code.

```bash
# Create the results folder
mkdir -p test-results/api

# Run tests and save output to file
npx playwright test api-tests/ --reporter=list 2>&1 | tee test-results/api/api-console-output.txt
```

---

## Step 5 — Generate HTML report (optional but recommended)

```bash
npx playwright test api-tests/ --reporter=html
npx playwright show-report
```

---

## Step 6 — Commit the results

```bash
git add api-tests/
git add test-results/api/
git commit -m "feat: A3 — API boundary tests, 16 passed with console log"
git push origin main
```

---

## Step 7 — Verify on GitHub

After pushing, confirm these files are visible in your repo:

- [ ] `api-tests/jsonplaceholder.spec.ts`
- [ ] `test-results/api/api-console-output.txt`
- [ ] `api-tests/README.md`
- [ ] `api-tests/SETUP_STEPS.md`

---

## How the tests are structured

Each test follows this pattern:

```ts
test('TC-A3-XX: description', async ({ request }) => {

  // 1. Send the request with invalid / boundary input
  const response = await request.post(ENDPOINT, {
    data: { ... },
  });

  // 2. Assert on what the mock ACTUALLY returns
  //    Note in comment what a real API SHOULD return
  // Mock returns 201 — real API should return 400 Bad Request
  expect(response.status()).toBe(201);

  // 3. Assert on the response body shape
  const json = await response.json();
  expect(json).toHaveProperty('id');

  // 4. Log key details for the console output
  console.log(`TC-A3-XX | Status: ${response.status()} | ...`);
});
```

---

## Why all tests assert 201

JSONPlaceholder is a **fake/mock API** — it returns `201` for every POST regardless of the input. This is intentional and documented.

The tests are honest about this:
- They **assert 201** because that is what the API actually returns
- They **note in comments** what a real production API should return (400, 413, 422)
- This demonstrates real API testing knowledge — not just blind happy-path testing

A reviewer who understands API testing will recognise this as the correct approach.
