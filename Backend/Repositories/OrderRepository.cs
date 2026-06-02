using Backend.Data;
using Backend.Models;
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
}
