# FCA Academy LMS Repair Loop

- **When:** 2026-06-25T14:13:33.051Z
- **Run ID:** LMS-WFR-1782396789807
- **Protocol:** Observe -> Act -> Review (FCA Academy coverage law)
- **Result:** OPEN � failures remain after bounded repair

## Rounds

### Round 1 � FAIL (138/173 steps)
- script:validate-academy-native-commerce-journey.mjs: failed
- lesson-media:APP-ELEC-101:1: missing lecture, labDemo
- lesson-media:APP-ELEC-101:2: missing lecture, labDemo
- lesson-media:APP-ELEC-101:3: missing lecture, labDemo
- lesson-media:APP-ELEC-101:4: missing lecture, labDemo
- lesson-media:APP-ELEC-101:5: missing lecture, labDemo
- lesson-media:APP-ELEC-101:6: missing lecture, labDemo
- lesson-media:CERT-OSHA30-201:1: missing lecture, labDemo
- lesson-media:CERT-OSHA30-201:2: missing lecture, labDemo
- lesson-media:CERT-OSHA30-201:3: missing lecture, labDemo
- lesson-media:CERT-OSHA30-201:4: missing lecture, labDemo
- lesson-media:CERT-OSHA30-201:5: missing lecture, labDemo
- lesson-media:CERT-OSHA30-201:6: missing lecture, labDemo
- lesson-media:DEG-AAS-110:1: missing lecture, labDemo
- lesson-media:DEG-AAS-110:2: missing lecture, labDemo
- lesson-media:DEG-AAS-110:3: missing lecture, labDemo
- lesson-media:DEG-AAS-110:4: missing lecture, labDemo
- lesson-media:DEG-AAS-110:5: missing lecture, labDemo
- lesson-media:DEG-AAS-110:6: missing lecture, labDemo
- lesson-media:LIC-DPOR-301:1: missing lecture, labDemo
- lesson-media:LIC-DPOR-301:2: missing lecture, labDemo
- lesson-media:LIC-DPOR-301:3: missing lecture, labDemo
- lesson-media:LIC-DPOR-301:4: missing lecture, labDemo
- lesson-media:LIC-DPOR-301:5: missing lecture, labDemo
- lesson-media:LIC-DPOR-301:6: missing lecture, labDemo
- lesson-media:GUIDE-FCA-001:6: missing lecture, labDemo
- lesson-media:FCA-BIDS-101:5: missing lecture, labDemo
- lesson-media:LEGAL-FORM-201:1: missing lecture, labDemo
- lesson-media:LEGAL-FORM-201:2: missing lecture, labDemo
- lesson-media:LEGAL-FORM-201:3: missing lecture, labDemo
- lesson-media:LEGAL-FORM-201:4: missing lecture, labDemo
- lesson-media:LEGAL-CONST-301:1: missing lecture, labDemo
- lesson-media:LEGAL-CONST-301:2: missing lecture, labDemo
- lesson-media:LEGAL-CONST-301:3: missing lecture, labDemo
- lesson-media:LEGAL-CONST-301:4: missing lecture, labDemo

## Repair actions taken

- **engineering-queue** Academy native commerce rail regression: engineering-queued
- **engineering-queue** Academy lesson media slots incomplete: engineering-queued



## Summary

Academy LMS simulation still failing after 1 bounded repair round(s). 2 item(s) queued. Consecutive failures: 5.

## For the founder

- This loop runs automatically every hour at :30 on `main`.
- Green end state = Academy LMS worked without manual walkthrough.
- Red end state = repair items queued; check `auricrux/system/work_queue.json` and `next_action.json`.
