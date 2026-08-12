# ClockIn: Test Log

Tested by: M6
Date run: _fill in_
Browser used: _fill in_

Run every row below on the finished app and mark PASS or FAIL.
Take a screenshot for at least two normal tests and two edge cases.

## Normal input

| # | What you do | What must happen | Result |
| --- | --- | --- | --- |
| 1 | Add "Amaka Obi" | Row appears, TOTAL becomes 1, badge reads Unmarked | |
| 2 | Add three more names | Four rows, TOTAL reads 4, order preserved | |
| 3 | Mark two present, one absent | PRESENT 2, ABSENT 1, one row still Unmarked | |
| 4 | Search "am" | Only matching rows show, counters unchanged | |
| 5 | Edit a name, then save | Name changes, Present badge survives | |
| 6 | Close the tab, reopen index.html | Everything returns with exact statuses | |

## Edge cases

| # | What you do | What must happen | Result |
| --- | --- | --- | --- |
| 7 | Click ADD with the box empty | Error shown, nothing added | |
| 8 | Click ADD with only spaces | Same error | |
| 9 | Add "A" | Error: name too short | |
| 10 | Add a name already on the list | Error: already on the list | |
| 11 | Add the same name in different capitals | Still rejected as duplicate | |
| 12 | Edit a name to empty and save | Error, stays in edit mode | |
| 13 | Edit a name to match another student | Rejected as duplicate | |
| 14 | Edit a name and save it unchanged | Allowed | |
| 15 | Search for something with no matches | "No student matches that name" | |
| 16 | Clear the search box | Full list returns | |
| 17 | Add a 100 character name | Accepted, layout does not break | |
| 18 | Delete every student one by one | Empty state returns, counters read 0 | |
| 19 | Open the app for the very first time | Empty state, no crash, no console error | |
| 20 | Mark present, refresh, then mark absent | Status flips correctly after reload | |

## The bug we found and fixed

**What happened:**

**What should have happened:**

**What caused it:**

**What fixed it:**

**Commit that fixed it:**
