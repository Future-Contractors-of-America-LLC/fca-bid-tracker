"""Design + preconstruction HTTP route surface for FCA SaaS validators."""

ROUTES = [
    "projects/{projectId}/design/sessions",
    "projects/{projectId}/precon-continuity",
    "projects/{projectId}/precon/sync-estimate",
    "projects/{projectId}/precon/price-estimate",
    "takeoffs/{takeoffId}/tether-estimate",
]


def register_design_precon_routes(app):
    return {"registered": True, "routes": ROUTES}
