# FCA Packet 062B â€” Public Entry Alignment and Track Depth

## Issue
Repo truth already contains multiple real SaaS and LMS slices, but public entry, login, and academy depth still under-signal that truth.

## Risk
- customers can miss real reachable SaaS tools already present in repo truth
- academy can still read lighter than required against FCA system-law expectations
- packet execution can drift away from the standing requirement that each packet produce at least 2 real SaaS functions/tools and 5 complete LMS courses covering apprenticeship, certification, degree, licensure, and FCA user-guide tracks

## Fix in 062B
This packet does four things:

1. aligns public and login surfaces to real reachable product slices
2. adds 2 new real SaaS tools at the portal command-center layer
3. adds 5 complete LMS courses for 5 specific track types
4. exposes the Academy catalog as a first-class reachable route

## Real SaaS functions/tools delivered
1. `stageMobilizationInvoiceTool` â€” creates a real billing-command invoice and routes the user into `/portal/billing`
2. `createPermitEscalationTool` â€” creates a real support-command request and routes the user into `/portal/support`

## Complete LMS courses delivered
1. Apprenticeship track â€” Electrical Apprenticeship Year 1: Jobsite Foundations
2. Certification track â€” OSHA 30 Construction Certification Prep Bootcamp
3. Degree track â€” A.A.S. Construction Operations: Semester 1 Studio
4. Licensure track â€” Virginia DPOR Residential Contractor License Prep
5. FCA user-guide how-to track â€” FCA Contractor Command User Guide: From Login to Closeout

## Next build step
062C should continue by wiring public package claims to exact route groups and adding route-level validation that these new academy tracks and new portal command tools remain reachable.