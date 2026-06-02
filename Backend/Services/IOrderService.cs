using Backend.DTOs;

namespace Backend.Services;

// Defines business logic operations for orders.
public interface IOrderService
{
    // Returns a single order DTO by ID, or null if not found.
    Task<OrderDto?> GetByIdAsync(int id);

    // Validates and creates an order, returning the created order as a DTO.
    Task<OrderDto> CreateAsync(CreateOrderDto dto);
}
