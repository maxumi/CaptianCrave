using Backend.Data;
using Backend.Models;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

// EF Core implementation of order data access.
public class OrderRepository(AppDbContext db) : IOrderRepository
{
    private readonly AppDbContext _db = db;

    // Fetches an order with user, restaurant, order items, and menu item details.
    public async Task<Order?> GetByIdAsync(int id) =>
        await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.User)
            .Include(o => o.Restaurant)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id);

    // Inserts a new order row (cascade saves order items) and returns it with its generated ID.
    public async Task<Order> CreateAsync(Order order)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order;
    }

    // Updates the status and updated_at timestamp of an existing order.
    public async Task<bool> UpdateStatusAsync(int id, OrderStatus status)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null)
            return false;

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Order>> GetActiveByRestaurantAsync(int restaurantId) =>
        await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.User)
            .Include(o => o.Restaurant)
            .AsNoTracking()
            .Where(o => o.RestaurantId == restaurantId)
            .Where(o => o.Status != OrderStatus.Delivered
                && o.Status != OrderStatus.Cancelled)
            .OrderByDescending(o => o.UpdatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Order>> GetHistoryByRestaurantAsync(int restaurantId) =>
        await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.User)
            .Include(o => o.Restaurant)
            .AsNoTracking()
            .Where(o => o.RestaurantId == restaurantId)
            .Where(o => o.Status == OrderStatus.Delivered
                || o.Status == OrderStatus.Cancelled)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();


    // Finds the first order for a user that is not delivered or cancelled.
    public async Task<Order?> GetActiveOrderForUserAsync(int userId) =>
        await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.User)
            .Include(o => o.Restaurant)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.UserId == userId
                && o.Status != OrderStatus.Delivered
                && o.Status != OrderStatus.Cancelled);

    public async Task<IEnumerable<Order>> GetHistoryForUserAsync(int userId) =>
        await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.User)
            .Include(o => o.Restaurant)
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .Where(o => o.Status == OrderStatus.Delivered
                || o.Status == OrderStatus.Cancelled)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
}
