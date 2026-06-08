# CaptainCrave Backend

ASP.NET Core 10 Web API for the CaptainCrave food ordering platform.

---

## Table of Contents

- [Architecture](#architecture)
- [Code Patterns](#code-patterns)
- [API Endpoints](#api-endpoints)
- [Technology](#technology)
- [Authentication](#authentication)
- [Secrets](#secrets)
- [Database](#database)
- [Running the Project](#running-the-project)
- [Changelog](#changelog)

---

## Architecture

The project follows Clean Architecture. Each layer has one responsibility and only depends on the layer beneath it.

```
Controller -> Service -> Repository -> Database
```

| Layer | Folder | Responsibility |
|---|---|---|
| Controllers | `Controllers/` | Receive HTTP requests, validate input, return responses |
| Services | `Services/` | Business logic and orchestration |
| Repositories | `Repositories/` | Database queries via EF Core |
| Models | `Models/` | EF Core entities mapped to database tables |
| DTOs | `DTOs/` | Data shapes at the API boundary |
| Mappers | `Mappers/` | Convert between models and DTOs |
| Configurations | `Data/Configurations/` | Fluent API table and column setup per entity |

**Rules:** controllers never touch the database directly, services never know about HTTP, repositories never contain business rules.

---

## Code Patterns

### Dependency injection
All services and repositories are registered as `Scoped` in `Program.cs` and injected via primary constructors:

```csharp
public class RestaurantService(IRestaurantRepository repo) : IRestaurantService
```

### DTOs at the boundary
Entities are never returned directly from controllers. Every response is mapped to a DTO via a static extension method:

```csharp
public static RestaurantDto ToDto(this Restaurant r) => new() { Id = r.Id, Name = r.Name, ... };
```

### Repository pattern
All database access goes through a typed interface. No `AppDbContext` in controllers or services:

```csharp
public interface IRestaurantRepository
{
    Task<IEnumerable<Restaurant>> GetAllAsync();
    Task<Restaurant?> GetByIdAsync(int id);
    Task<Restaurant> CreateAsync(Restaurant restaurant);
}
```

### Input validation
Simple rules use data annotations. Cross-field rules (e.g. delivery address required when type is `Delivery`) use `IValidatableObject`:

```csharp
public IEnumerable<ValidationResult> Validate(ValidationContext ctx)
{
    if (DeliveryType == DeliveryType.Delivery && string.IsNullOrWhiteSpace(DeliveryAddress))
        yield return new ValidationResult("Delivery address is required.", [nameof(DeliveryAddress)]);
}
```

### Role-based authorization
Endpoints are protected with `[Authorize(Roles = "...")]`. The role is embedded in the JWT at login. Public read endpoints have no attribute:

```csharp
[HttpPost]
[Authorize(Roles = "Restaurant,Admin")]
public async Task<IActionResult> Create(CreateRestaurantDto dto) { ... }
```

### Error handling
Services throw typed exceptions. Controllers catch them and map to HTTP status codes:

```csharp
catch (KeyNotFoundException ex)  { return BadRequest(new { message = ex.Message }); }
catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
```

### Fluent API configuration
Each entity has its own `IEntityTypeConfiguration<T>` in `Data/Configurations/`, keeping `AppDbContext.OnModelCreating` clean.

---

## API Endpoints

### Auth (public)
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Login and receive a JWT token |

### Restaurants (public read, restricted write)
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/restaurants` | Public | List all restaurants |
| GET | `/api/restaurants/{id}` | Public | Get a restaurant by ID |
| GET | `/api/restaurants/{id}/menu-items` | Public | Get menu items for a restaurant |
| POST | `/api/restaurants` | Restaurant, Admin | Create a restaurant |

### Menu Items
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/menuitems` | Restaurant, Admin | Create a menu item |

### Categories
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/categories/by-restaurant/{id}` | Public | Get categories for a restaurant |
| POST | `/api/categories` | Restaurant, Admin | Create a category |

### Orders
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Customer, Admin | Place an order |
| GET | `/api/orders/{id}` | Authenticated | Get order details |
| PATCH | `/api/orders/{id}/status` | Restaurant, Admin | Update order status |

---

## Technology

| Package | Purpose |
|---|---|
| .NET 10 / ASP.NET Core 10 | Web framework |
| Entity Framework Core 10 | Code-first ORM with SQL Server |
| BCrypt.Net-Next | Password hashing |
| System.IdentityModel.Tokens.Jwt | JWT generation and validation |
| Swashbuckle / Swagger | API documentation at `/swagger` |
| Microsoft.OpenApi 2.4.1 | OpenAPI types for Swagger JWT config |

---

## Authentication

1. User registers with name, email, and password.
2. Password is hashed with BCrypt before storage. Plain-text is never saved.
3. On login, the submitted password is verified against the stored hash.
4. A signed JWT is returned containing the user ID, email, and role as claims.
5. Protected routes require `Authorization: Bearer <token>` in the request header.

The token is signed with HMAC-SHA256 using the secret configured in user secrets.

---

## Secrets

Sensitive values are not stored in source code or `appsettings.json`. They are managed with the .NET User Secrets manager.

| Key | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `Jwt:Secret` | Signing key for JWT tokens (minimum 32 characters) |

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "your_connection_string"
dotnet user-secrets set "Jwt:Secret" "your_jwt_secret_key"
```

`appsettings.json` contains non-sensitive defaults only (issuer, audience, expiry) and is safe to commit.

---

## Database

Managed with EF Core migrations. All tables use snake_case column names configured via Fluent API.

Apply all pending migrations:
```bash
dotnet ef database update
```

Add a new migration after changing a model:
```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

---

## Running the Project

```bash
dotnet run
```

Swagger UI is available at `https://localhost:<port>/swagger` in Development mode.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of backend changes.

