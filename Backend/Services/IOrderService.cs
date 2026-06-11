using Backend.DTOs;

namespace Backend.Services;

// Defines business logic operations for orders.
public interface IOrderService
{
    // Returns a single order DTO by ID, or null if not found.
    Task<OrderDto?> GetByIdAsync(int id);

    // Validates and creates an order, returning the created order as a DTO.
    Task<OrderDto> CreateAsync(CreateOrderDto dto);

    // Updates the status of an order. Returns false if the order does not exist.
    Task<bool> UpdateStatusAsync(int id, UpdateOrderStatusDto dto, int actorUserId, string actorRole);

    // Returns active orders for the restaurant linked to the actor user.
    Task<IEnumerable<OrderDto>> GetRestaurantActiveOrdersAsync(int actorUserId, string actorRole);

    // Returns delivered/cancelled orders for the restaurant linked to the actor user.
    Task<IEnumerable<OrderDto>> GetRestaurantHistoricOrdersAsync(int actorUserId, string actorRole);

    // Returns the active order for a user, or null if none exists.
    Task<OrderDto?> GetActiveOrderForUserAsync(int userId);

    // Returns delivered/cancelled orders for a user.
    Task<IEnumerable<OrderDto>> GetHistoricOrdersForUserAsync(int userId);
}
