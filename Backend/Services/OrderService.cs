using Backend.DTOs;
using Backend.Mappers;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

// Handles business logic for order operations.
public class OrderService(
    IOrderRepository orderRepository,
    IUserRepository userRepository,
    IRestaurantRepository restaurantRepository,
    IMenuItemRepository menuItemRepository) : IOrderService
{
    private readonly IOrderRepository _orderRepository = orderRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IRestaurantRepository _restaurantRepository = restaurantRepository;
    private readonly IMenuItemRepository _menuItemRepository = menuItemRepository;

    // Retrieves an order by ID and maps it to a DTO, or returns null if not found.
    public async Task<OrderDto?> GetByIdAsync(int id)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        return order?.ToDto();
    }

    // Validates the order, builds the entity, persists it, and returns the DTO.
    public async Task<OrderDto> CreateAsync(CreateOrderDto dto)
    {
        var user = await _userRepository.GetByIdAsync(dto.UserId)
            ?? throw new KeyNotFoundException($"User {dto.UserId} not found.");

        var restaurant = await _restaurantRepository.GetByIdAsync(dto.RestaurantId)
            ?? throw new KeyNotFoundException($"Restaurant {dto.RestaurantId} not found.");

        var order = new Order
        {
            UserId = user.Id,
            RestaurantId = restaurant.Id,
            DeliveryType = dto.DeliveryType,
            DeliveryAddress = dto.DeliveryAddress,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        decimal total = 0;

        foreach (var itemDto in dto.Items)
        {
            var menuItem = await _menuItemRepository.GetByIdAsync(itemDto.MenuItemId)
                ?? throw new KeyNotFoundException($"Menu item {itemDto.MenuItemId} not found.");

            var orderItem = itemDto.ToOrderItem(menuItem.Price);
            total += menuItem.Price * itemDto.Quantity;
            order.OrderItems.Add(orderItem);
        }

        order.TotalPrice = total;

        var created = await _orderRepository.CreateAsync(order);

        // Populate navigation properties so the mapper can read them without a second query.
        created.User = user;
        created.Restaurant = restaurant;

        return created.ToDto();
    }

    // Delegates status update to the repository.
    public async Task<bool> UpdateStatusAsync(int id, UpdateOrderStatusDto dto) =>
        await _orderRepository.UpdateStatusAsync(id, dto.Status);

    // Retrieves the active order for a user.
    public async Task<OrderDto?> GetActiveOrderForUserAsync(int userId)
    {
        var order = await _orderRepository.GetActiveOrderForUserAsync(userId);
        return order?.ToDto();
    }
}
