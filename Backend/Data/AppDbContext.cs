using Backend.Data.Configurations;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // test
    public DbSet<TestItem> TestItems => Set<TestItem>();

    public DbSet<User> Users { get; set; }

    public DbSet<Restaurant> Restaurants { get; set; }

    public DbSet<MenuItem> MenuItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new RestaurantConfiguration());
        modelBuilder.ApplyConfiguration(new MenuItemConfiguration());
    }
}
