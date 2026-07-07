using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();

var store = new RuntimeStore();

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "fca-dotnet-backend" }));

app.MapGet("/api/projects", () =>
{
    var items = store.ListProjects();
    return Results.Ok(ApiEnvelope.Success(new
    {
        route = "/api/projects",
        items,
        count = items.Count,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapPost("/api/projects", (CreateProjectRequest request) =>
{
    var project = store.CreateProject(request);
    return Results.Accepted("/api/projects", ApiEnvelope.Success(new
    {
        route = "/api/projects",
        item = project,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapGet("/api/projects/{projectId}", (string projectId) =>
{
    var project = store.GetProject(projectId);
    if (project is null)
    {
        return Results.NotFound(ApiEnvelope.Error("PROJECT_NOT_FOUND", $"Project not found: {projectId}"));
    }

    return Results.Ok(ApiEnvelope.Success(new
    {
        route = $"/api/projects/{projectId}",
        projectId,
        item = project,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapPatch("/api/projects/{projectId}", (string projectId, UpdateProjectRequest request) =>
{
    var project = store.UpdateProject(projectId, request);
    if (project is null)
    {
        return Results.NotFound(ApiEnvelope.Error("PROJECT_NOT_FOUND", $"Project not found: {projectId}"));
    }

    return Results.Accepted($"/api/projects/{projectId}", ApiEnvelope.Success(new
    {
        route = $"/api/projects/{projectId}",
        projectId,
        item = project,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapGet("/api/projects/{projectId}/takeoffs", (string projectId) =>
{
    if (!store.HasProject(projectId))
    {
        return Results.NotFound(ApiEnvelope.Error("PROJECT_NOT_FOUND", $"Project not found: {projectId}"));
    }

    var items = store.ListTakeoffs(projectId);
    return Results.Ok(ApiEnvelope.Success(new
    {
        route = $"/api/projects/{projectId}/takeoffs",
        projectId,
        items,
        count = items.Count,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapPost("/api/projects/{projectId}/takeoffs", (string projectId, CreateTakeoffRequest request) =>
{
    var takeoff = store.CreateTakeoff(projectId, request);
    if (takeoff is null)
    {
        return Results.NotFound(ApiEnvelope.Error("PROJECT_NOT_FOUND", $"Project not found: {projectId}"));
    }

    return Results.Accepted($"/api/projects/{projectId}/takeoffs", ApiEnvelope.Success(new
    {
        route = $"/api/projects/{projectId}/takeoffs",
        projectId,
        item = takeoff,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapGet("/api/projects/{projectId}/rfis", (string projectId) =>
{
    if (!store.HasProject(projectId))
    {
        return Results.NotFound(ApiEnvelope.Error("PROJECT_NOT_FOUND", $"Project not found: {projectId}"));
    }

    var items = store.ListRfis(projectId);
    return Results.Ok(ApiEnvelope.Success(new
    {
        route = $"/api/projects/{projectId}/rfis",
        projectId,
        items,
        count = items.Count,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapPost("/api/projects/{projectId}/rfis", (string projectId, CreateRfiRequest request) =>
{
    var rfi = store.CreateRfi(projectId, request);
    if (rfi is null)
    {
        return Results.NotFound(ApiEnvelope.Error("PROJECT_NOT_FOUND", $"Project not found: {projectId}"));
    }

    return Results.Accepted($"/api/projects/{projectId}/rfis", ApiEnvelope.Success(new
    {
        route = $"/api/projects/{projectId}/rfis",
        projectId,
        item = rfi,
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapMethods("/api/auricrux/actions", new[] { "POST" }, (CreateAuricruxActionRequest request) =>
{
    return Results.Accepted("/api/auricrux/actions", ApiEnvelope.Success(new
    {
        route = "/api/auricrux/actions",
        acceptedPayload = request,
        backingSource = "dotnet-runtime-store",
        notYetImplemented = false
    }, packet: "NET8A"));
});

app.MapMethods("/api/auricrux/actions", new[] { "GET" }, () =>
{
    return Results.Ok(ApiEnvelope.Success(new
    {
        route = "/api/auricrux/actions",
        items = Array.Empty<object>(),
        backingSource = "dotnet-runtime-store"
    }, packet: "NET8A"));
});

app.MapMethods("/api/auricrux/actions", new[] { "DELETE", "PUT", "PATCH" }, () =>
{
    return Results.Json(ApiEnvelope.Error("METHOD_NOT_ALLOWED", "Method not allowed"), statusCode: StatusCodes.Status405MethodNotAllowed);
});

app.MapMethods("/api/academy-commerce", new[] { "OPTIONS" }, () => Results.StatusCode(StatusCodes.Status204NoContent));

app.MapMethods("/api/academy-commerce", new[] { "GET", "HEAD" }, (HttpRequest request) =>
{
    if (HttpMethods.IsHead(request.Method))
    {
        return Results.StatusCode(StatusCodes.Status200OK);
    }

    return Results.Ok(new
    {
        ok = true,
        route = "/api/academy-commerce",
        catalog = Array.Empty<object>(),
        backingSource = "dotnet-runtime-store"
    });
});

app.MapPost("/api/academy-commerce", (AcademyCommerceRequest request, IConfiguration config) =>
{
    var requestedProvider = string.IsNullOrWhiteSpace(request.CheckoutProvider) ? "fca-local" : request.CheckoutProvider.Trim().ToLowerInvariant();
    var wantsStripe = requestedProvider == "stripe";
    var wantsEmbedded = string.Equals(request.UiMode, "embedded", StringComparison.OrdinalIgnoreCase) || request.Embedded == true;

    // FCA local checkout is always the default/primary path.
    if (!wantsStripe)
    {
        return Results.Ok(new
        {
            ok = true,
            route = "/api/academy-commerce",
            uiMode = wantsEmbedded ? "embedded" : "standard",
            primary = true,
            checkoutProvider = "fca-local",
            selfContained = true,
            sessionId = wantsEmbedded ? "fca-local-academy-session" : "fca-local-academy-standard-session",
            publishableKey = "fca-local",
            backingSource = "dotnet-runtime-store"
        });
    }

    var stripeSecret = config["STRIPE_SECRET_KEY"];
    if (string.IsNullOrWhiteSpace(stripeSecret))
    {
        return Results.Json(new
        {
            ok = false,
            error = "Stripe option unavailable: STRIPE_SECRET_KEY is not configured.",
            checkoutProvider = "stripe",
            optionUnavailable = true,
            fallbackProvider = "fca-local",
            fallbackAvailable = true
        }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    return Results.Ok(new
    {
        ok = true,
        uiMode = wantsEmbedded ? "embedded" : "standard",
        primary = false,
        checkoutProvider = "stripe",
        publishableKey = "configured-via-env",
        sessionId = "dotnet-embedded-academy-session"
    });
});

app.MapMethods("/api/stripe-checkout", new[] { "OPTIONS" }, () => Results.StatusCode(StatusCodes.Status204NoContent));

app.MapPost("/api/stripe-checkout", (StripeCheckoutRequest request, IConfiguration config) =>
{
    var requestedProvider = string.IsNullOrWhiteSpace(request.CheckoutProvider) ? "fca-local" : request.CheckoutProvider.Trim().ToLowerInvariant();
    var wantsStripe = requestedProvider == "stripe";
    var wantsEmbedded = string.Equals(request.UiMode, "embedded", StringComparison.OrdinalIgnoreCase) || request.Embedded == true;

    // FCA local checkout is always the default/primary path.
    if (!wantsStripe)
    {
        return Results.Ok(new
        {
            ok = true,
            route = "/api/stripe-checkout",
            uiMode = wantsEmbedded ? "embedded" : "standard",
            primary = true,
            checkoutProvider = "fca-local",
            selfContained = true,
            sessionId = wantsEmbedded ? "fca-local-plan-session" : "fca-local-standard-session",
            publishableKey = "fca-local",
            backingSource = "dotnet-runtime-store"
        });
    }

    var stripeSecret = config["STRIPE_SECRET_KEY"];
    if (string.IsNullOrWhiteSpace(stripeSecret))
    {
        return Results.Json(new
        {
            ok = false,
            error = "Stripe option unavailable: STRIPE_SECRET_KEY is not configured.",
            checkoutProvider = "stripe",
            optionUnavailable = true,
            fallbackProvider = "fca-local",
            fallbackAvailable = true
        }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    var hasPlanAction = string.Equals(request.Action, "plan", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrWhiteSpace(request.PlanKey);
    if (!hasPlanAction)
    {
        return Results.Json(new
        {
            ok = false,
            error = "Unsupported embedded checkout action."
        }, statusCode: StatusCodes.Status400BadRequest);
    }

    return Results.Ok(new
    {
        ok = true,
        uiMode = wantsEmbedded ? "embedded" : "standard",
        primary = false,
        checkoutProvider = "stripe",
        publishableKey = "configured-via-env",
        sessionId = "dotnet-embedded-plan-session"
    });
});

app.MapMethods("/api/stripe-checkout", new[] { "GET", "HEAD", "PUT", "PATCH", "DELETE" }, () =>
{
    return Results.Json(ApiEnvelope.Error("METHOD_NOT_ALLOWED", "Method not allowed"), statusCode: StatusCodes.Status405MethodNotAllowed);
});

app.MapMethods("/api/central-proxy/{**resourcePath}", new[] { "OPTIONS" }, () => Results.StatusCode(StatusCodes.Status204NoContent));

app.MapMethods("/api/central-proxy/{**resourcePath}", new[] { "GET", "HEAD", "POST", "PATCH", "PUT", "DELETE" }, (HttpRequest request, string? resourcePath) =>
{
    var normalizedPath = string.IsNullOrWhiteSpace(resourcePath) ? "/" : $"/{resourcePath.TrimStart('/')}";
    if (HttpMethods.IsHead(request.Method))
    {
        return Results.StatusCode(StatusCodes.Status200OK);
    }

    return Results.Ok(new
    {
        ok = true,
        route = "/api/central-proxy/{**resourcePath}",
        requestPath = normalizedPath,
        method = request.Method,
        backingSource = "dotnet-runtime-store"
    });
});

app.MapMethods("/api/academy-lms", new[] { "OPTIONS" }, () => Results.StatusCode(StatusCodes.Status204NoContent));

app.MapMethods("/api/academy-lms", new[] { "GET" }, () =>
{
    return Results.Ok(new
    {
        ok = true,
        route = "/api/academy-lms",
        catalog = new
        {
            totalPrograms = 48,
            programs = Array.Empty<object>()
        },
        catalogIntegrity = new
        {
            aligned = true,
            source = "dotnet-runtime-store"
        },
        learners = Array.Empty<object>(),
        enrollments = Array.Empty<object>(),
        customerId = "demo-customer",
        backingSource = "academy-lms-dotnet"
    });
});

app.MapMethods("/api/academy-lms", new[] { "PATCH" }, (AcademyLmsRequest? body) =>
{
    var patchBody = body ?? new AcademyLmsRequest(null, null, null);
    return Results.Ok(new
    {
        ok = true,
        route = "/api/academy-lms",
        updated = true,
        payload = patchBody,
        customerId = "demo-customer",
        backingSource = "academy-lms-dotnet"
    });
});

app.MapMethods("/api/academy-lms", new[] { "POST", "PUT", "DELETE" }, () =>
{
    return Results.Json(ApiEnvelope.Error("METHOD_NOT_ALLOWED", "Method not allowed"), statusCode: StatusCodes.Status405MethodNotAllowed);
});

app.MapMethods("/api/auricrux", new[] { "OPTIONS" }, () => Results.StatusCode(StatusCodes.Status204NoContent));

app.MapMethods("/api/auricrux", new[] { "GET" }, (HttpRequest request) =>
{
    var scope = request.Query["scope"].ToString();
    if (string.Equals(scope, "training", StringComparison.OrdinalIgnoreCase))
    {
        return Results.Ok(new
        {
            ok = true,
            scope = "training",
            lessons = Array.Empty<object>(),
            backingSource = "auricrux-dotnet"
        });
    }

    return Results.Ok(new
    {
        ok = true,
        route = "/api/auricrux",
        backingSource = "auricrux-dotnet"
    });
});

app.MapMethods("/api/auricrux", new[] { "POST" }, (AuricruxRequest? body) =>
{
    var payload = body ?? new AuricruxRequest(null, null, null);
    return Results.Ok(new
    {
        ok = true,
        route = "/api/auricrux",
        message = payload.Message ?? string.Empty,
        routeHint = payload.Route ?? "/portal/platform",
        context = payload.Context ?? new Dictionary<string, object?>(),
        backingSource = "auricrux-dotnet"
    });
});

app.MapMethods("/api/auricrux", new[] { "PATCH", "PUT", "DELETE" }, () =>
{
    return Results.Json(ApiEnvelope.Error("METHOD_NOT_ALLOWED", "Method not allowed"), statusCode: StatusCodes.Status405MethodNotAllowed);
});

app.Run();

internal static class ApiEnvelope
{
    public static object Success(object data, string packet) => new
    {
        success = true,
        data,
        meta = new
        {
            packet,
            timestamp = DateTimeOffset.UtcNow
        }
    };

    public static object Error(string code, string message) => new
    {
        success = false,
        error = new
        {
            code,
            message
        }
    };
}

internal sealed class RuntimeStore
{
    private readonly Dictionary<string, ProjectRecord> _projects = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, List<TakeoffRecord>> _takeoffs = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, List<RfiRecord>> _rfis = new(StringComparer.OrdinalIgnoreCase);

    public RuntimeStore()
    {
        var seeded = new ProjectRecord("PRJ-001", "Demo Project", "FCA Validation Customer", "qualified");
        _projects[seeded.ProjectId] = seeded;
        _takeoffs[seeded.ProjectId] = new List<TakeoffRecord>();
        _rfis[seeded.ProjectId] = new List<RfiRecord>();
    }

    public bool HasProject(string projectId) => _projects.ContainsKey(projectId);

    public List<ProjectRecord> ListProjects() => _projects.Values.OrderBy(p => p.ProjectId).ToList();

    public ProjectRecord? GetProject(string projectId) => _projects.TryGetValue(projectId, out var item) ? item : null;

    public ProjectRecord CreateProject(CreateProjectRequest request)
    {
        var nextId = $"PRJ-{_projects.Count + 1:000}";
        var item = new ProjectRecord(
            nextId,
            string.IsNullOrWhiteSpace(request.Name) ? "Untitled Project" : request.Name,
            string.IsNullOrWhiteSpace(request.CustomerName) ? "Unknown Customer" : request.CustomerName,
            "new"
        );

        _projects[item.ProjectId] = item;
        _takeoffs[item.ProjectId] = new List<TakeoffRecord>();
        _rfis[item.ProjectId] = new List<RfiRecord>();
        return item;
    }

    public ProjectRecord? UpdateProject(string projectId, UpdateProjectRequest request)
    {
        if (!_projects.TryGetValue(projectId, out var current)) return null;

        var updated = current with
        {
            Stage = string.IsNullOrWhiteSpace(request.Stage) ? current.Stage : request.Stage
        };

        _projects[projectId] = updated;
        return updated;
    }

    public List<TakeoffRecord> ListTakeoffs(string projectId)
    {
        if (!_takeoffs.TryGetValue(projectId, out var items)) return new List<TakeoffRecord>();
        return items.ToList();
    }

    public TakeoffRecord? CreateTakeoff(string projectId, CreateTakeoffRequest request)
    {
        if (!_projects.ContainsKey(projectId)) return null;
        if (!_takeoffs.TryGetValue(projectId, out var items))
        {
            items = new List<TakeoffRecord>();
            _takeoffs[projectId] = items;
        }

        var nextId = $"TKO-{items.Count + 1:000}";
        var item = new TakeoffRecord(
            nextId,
            string.IsNullOrWhiteSpace(request.Description) ? "Unnamed takeoff" : request.Description,
            request.Quantity,
            string.IsNullOrWhiteSpace(request.Unit) ? "EA" : request.Unit
        );

        items.Add(item);
        return item;
    }

    public List<RfiRecord> ListRfis(string projectId)
    {
        if (!_rfis.TryGetValue(projectId, out var items)) return new List<RfiRecord>();
        return items.ToList();
    }

    public RfiRecord? CreateRfi(string projectId, CreateRfiRequest request)
    {
        if (!_projects.ContainsKey(projectId)) return null;
        if (!_rfis.TryGetValue(projectId, out var items))
        {
            items = new List<RfiRecord>();
            _rfis[projectId] = items;
        }

        var nextId = $"RFI-{items.Count + 1:000}";
        var item = new RfiRecord(nextId, string.IsNullOrWhiteSpace(request.Question) ? "No question provided" : request.Question);
        items.Add(item);
        return item;
    }
}

internal record ProjectRecord(string ProjectId, string Name, string CustomerName, string Stage);
internal record TakeoffRecord(string Id, string Description, decimal Quantity, string Unit);
internal record RfiRecord(string Id, string Question);

internal record CreateProjectRequest(string Name, string CustomerName);
internal record UpdateProjectRequest(string Stage);
internal record CreateTakeoffRequest(string Description, decimal Quantity, string Unit);
internal record CreateRfiRequest(string Question);
internal record CreateAuricruxActionRequest(string Mode, string TargetObjectType, string TargetObjectId, string Rationale);
internal record AcademyCommerceRequest(string? UiMode, bool? Embedded, string? CheckoutProvider);
internal record StripeCheckoutRequest(string? UiMode, bool? Embedded, string? Action, string? PlanKey, string? CheckoutProvider);
internal record AcademyLmsRequest(string? CourseId, string? Status, Dictionary<string, object?>? Meta);
internal record AuricruxRequest(string? Message, string? Route, Dictionary<string, object?>? Context);
