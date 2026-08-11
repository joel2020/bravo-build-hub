# Task 1 report: Simplify and regroup the desktop header

## Status

DONE

## Files changed

- `artifacts/bravo-mechanical/src/components/Header.tsx`
  - Replaced the broad desktop navigation and More menu with Services and Service Areas dropdowns plus direct Projects and Reviews links.
  - Added the approved service and priority-area datasets verbatim.
  - Added child-route active states to both dropdown triggers.
  - Changed only the desktop CTA copy to `Request Service`; the mobile navigation and CTA remain unchanged.
- `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`
  - Replaced the former desktop navigation test with intent-based navigation, dropdown destination, keyboard focus restoration, and group-active regression coverage.

## TDD and verification

1. Red run after adding the new tests:
   - Command: `PORT=8080 pnpm --filter @workspace/bravo-mechanical test -- frontend-remediation.test.tsx`
   - Result: exit 1; 4 new tests failed and 38 passed because the old header lacked the requested dropdown buttons, active trigger contracts, and `Request Service` CTA.
2. Green run after implementation:
   - Command: `PORT=8080 pnpm --filter @workspace/bravo-mechanical test -- frontend-remediation.test.tsx`
   - Result: exit 0; 3 test files passed, 42 tests passed.
3. Self-review:
   - Command: `git diff --check`
   - Result: exit 0 with no whitespace errors.
   - Reviewed the scoped diff and confirmed the mobile `nav` array, trigger behavior, phone links/tracking, and mobile CTA copy were not changed.

## Commit

Implementation commit: `42af983` (`feat: simplify desktop header navigation`).

## Concerns

None.
