using Backend.Data.Configurations;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

// The main database context, registers all tables and their configurations
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TestItem> TestItems => Set<TestItem>();

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new UserConfiguration());
    }
}
