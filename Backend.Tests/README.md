# Backend.Tests

Unit tests for the CaptainCrave backend API controllers.

## Tech Stack

| Package | Purpose |
|---|---|
| **xUnit** | Test framework — discovers and runs tests |
| **Moq** | Mocking library — replaces real service dependencies with fakes |
| **Microsoft.AspNetCore.Mvc.Testing** | Provides ASP.NET Core types (e.g. `OkObjectResult`) without spinning up a server |
| **Microsoft.EntityFrameworkCore.InMemory** | In-memory database provider for any tests that need a real `DbContext` |

## Structure

```
Controllers/
  AuthControllerTests.cs
  CategoryControllerTests.cs
  MenuItemControllerTests.cs
  RestaurantControllerTests.cs
```

Each test class mirrors its corresponding controller and follows the pattern:

1. Create a `Mock<IXxxService>` using Moq.
2. Inject the mock into the controller under test.
3. Set up the mock to return a specific value (`.Setup(...).ReturnsAsync(...)`).
4. Call the controller method and assert the result type and value.

This keeps tests isolated — no database, no HTTP pipeline, no real service logic.

## Why `[Fact]`?

xUnit offers two attributes for test methods:

- **`[Fact]`** — a single, standalone test with no parameters. Used here because each scenario has its own hardcoded inputs and expected outputs, making the test self-documenting and easy to debug individually.
- **`[Theory]`** — a parameterised test that runs the same logic with multiple data sets via `[InlineData]` or `[MemberData]`. Useful when the same behaviour needs to be verified across many inputs.

All tests in this project use `[Fact]` because each case has distinct setup logic (different mock return values, different model-state errors) that would not benefit from parameterisation.

## Running the Tests

```bash
dotnet test
```

Or run a specific file:

```bash
dotnet test --filter "FullyQualifiedName~RestaurantControllerTests"
```
