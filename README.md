# CaptainCrave

## Local secrets for Backend

From the `Backend` folder, set these user-secrets before running the API:

```powershell
dotnet user-secrets set "Jwt:Secret" "replace-with-a-long-random-secret"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\MSSQLLocalDB;Database=CaptainCrave;Trusted_Connection=True;TrustServerCertificate=True;"
```

`Jwt:Secret` must be at least 32 bytes for `HS256`, so use a long random value.

