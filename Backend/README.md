# CaptainCrave Backend

ASP.NET Core 10 Web API for the CaptainCrave food ordering platform.

---

## Architecture (Clean Architecture)

The project follows a layered clean architecture pattern. Each layer has a single responsibility and depends only on the layer below it.

```
Controller  ->  Service  ->  Repository  ->  Database
```

| Layer | Folder | Responsibility |
|---|---|---|
| Controllers | `Controllers/` | Receive HTTP requests, validate input, return responses |
| Services | `Services/` | Business logic |
| Repositories | `Repositories/` | Database queries via Entity Framework Core |
| Models | `Models/` | EF Core entities mapped to database tables |
| DTOs | `DTOs/` | Data shapes used at the API boundary (no entities exposed directly) |
| Mappers | `Mappers/` | Convert between models and DTOs |
| Configurations | `Data/Configurations/` | Fluent API table/column setup per entity |

Controllers never touch the database directly. Services never know about HTTP. Repositories never contain business rules.

---

## Technology

- **.NET 10 / ASP.NET Core 10** — web framework
- **Entity Framework Core 10** — code-first ORM with SQL Server
- **BCrypt.Net-Next** — password hashing
- **JWT Bearer (System.IdentityModel.Tokens.Jwt)** — stateless authentication
- **Swashbuckle / Swagger** — API documentation at `/swagger`

---

## Authentication

Registration and login are handled by `AuthController`. The flow is:

1. User registers with name, email, and password.
2. The password is hashed using BCrypt before being stored. The plain-text password is never saved.
3. On login, the submitted password is verified against the stored hash using BCrypt.
4. If valid, a signed JWT is returned.
5. Protected routes require the JWT in the `Authorization: Bearer <token>` header.

The token contains the user ID, email, and role as claims, and is signed with an HMAC-SHA256 key.

---

## Secrets

Sensitive values are **not stored in source code or `appsettings.json`**. They are stored using the .NET User Secrets manager during development.

The following secrets are required to run the project:

| Key | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `Jwt:Secret` | Signing key for JWT tokens (minimum 32 characters) |

To set them locally:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "your_connection_string"
dotnet user-secrets set "Jwt:Secret" "your_jwt_secret_key"
```

The `appsettings.json` file contains non-sensitive defaults only (issuer, audience, expiry). It is safe to commit.

---

## Database

The database is managed with EF Core migrations. To apply all pending migrations:

```bash
dotnet ef database update
```

To add a new migration after changing a model:

```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

Table and column names follow snake_case convention, configured via Fluent API in `Data/Configurations/`.

---

## Running the Project

```bash
dotnet run
```

Swagger UI is available at `https://localhost:<port>/swagger` when running in Development mode.
