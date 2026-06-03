# Portal Brand Continuity Pass

## Objective
Extend the locked FCA and Auricrux brand system beyond public marketing routes into the customer workspace shell.

## Applied decisions
- FCA remains the parent workspace brand inside portal and dashboard routes.
- Auricrux remains the embedded operating layer visible inside the same shell.
- Portal routes should feel like a continuation of the public shell, not a separate product.

## Implemented in this pass
- Added FCA and Auricrux brand presence directly inside `PortalShell`.
- Added brand reinforcement blocks to:
  - `PortalHome`
  - `PlatformDashboard`
- Preserved all existing route behavior and workspace-state logic.

## Result
The user journey now presents a more continuous sequence:
1. Public shell
2. Login / workspace entry
3. Portal shell
4. Platform dashboard
5. Academy / support / admin continuation

This reduces the visual break between public conversion pages and the working FCA workspace.
