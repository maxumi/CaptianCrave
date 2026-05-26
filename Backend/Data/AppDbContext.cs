using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // Add DbSets here as models are created
    // public DbSet<User> Users => Set<User>();
}
