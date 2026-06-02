using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

// EF Core implementation of menu item data access.
public class MenuItemRepository(AppDbContext db) : IMenuItemRepository
{
    private readonly AppDbContext _db = db;

    // Fetches all menu items belonging to the given restaurant.
    public async Task<IEnumerable<MenuItem>> GetByRestaurantIdAsync(int restaurantId) =>
        await _db.MenuItems.AsNoTracking().Where(m => m.RestaurantId == restaurantId).ToListAsync();

    // Fetches all menu items under the given category.
    public async Task<IEnumerable<MenuItem>> GetByCategoryIdAsync(int categoryId) =>
        await _db.MenuItems.AsNoTracking().Where(m => m.CategoryId == categoryId).ToListAsync();

    // Fetches a single menu item by primary key.
    public async Task<MenuItem?> GetByIdAsync(int id) =>
        await _db.MenuItems.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);

    // Inserts a new menu item row and returns it with its generated ID.
    public async Task<MenuItem> CreateAsync(MenuItem menuItem)
    {
        _db.MenuItems.Add(menuItem);
        await _db.SaveChangesAsync();
        return menuItem;
    }
}
