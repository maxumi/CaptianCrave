using Backend.Models;

namespace Backend.Repositories;

// Defines data access operations for orders.
public interface IOrderRepository
{
    // Returns an order with all navigation properties loaded, or null if not found.
    Task<Order?> GetByIdAsync(int id);

    // Saves a new order (with its items) and returns it with the generated ID.
    Task<Order> CreateAsync(Order order);
}
