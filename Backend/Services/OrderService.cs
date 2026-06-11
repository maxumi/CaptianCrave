using Backend.DTOs;
using Backend.Mappers;
using Backend.Models;
using Backend.Models.Enums;
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

    public async Task<IEnumerable<OrderDto>> GetRestaurantActiveOrdersAsync(int currentUserId, UserRole currentUserRole)
    {
        var restaurantId = await ResolveRestaurantIdForUserAsync(currentUserId, currentUserRole);
        var orders = await _orderRepository.GetActiveByRestaurantAsync(restaurantId);
        return orders.Select(order => order.ToDto());
    }

    public async Task<IEnumerable<OrderDto>> GetRestaurantHistoricOrdersAsync(int currentUserId, UserRole currentUserRole)
    {
        var restaurantId = await ResolveRestaurantIdForUserAsync(currentUserId, currentUserRole);
        var orders = await _orderRepository.GetHistoryByRestaurantAsync(restaurantId);
        return orders.Select(order => order.ToDto());
    }

    // Validates ownership + transition rules and delegates status update to repository.
    public async Task<bool> UpdateStatusAsync(int id, UpdateOrderStatusDto dto, int currentUserId, UserRole currentUserRole)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order is null)
            return false;

        if (currentUserRole == UserRole.Restaurant)
        {
            var restaurant = await _restaurantRepository.GetSingleByUserIdAsync(currentUserId)
                ?? throw new UnauthorizedAccessException("Restaurant profile not found for current user.");

            if (order.RestaurantId != restaurant.Id)
                throw new UnauthorizedAccessException("You can only update orders for your own restaurant.");
        }

        if (IsTerminal(order.Status))
            throw new InvalidOperationException("Historic orders cannot be updated.");

        if (!IsValidTransition(order.DeliveryType, order.Status, dto.Status))
            throw new InvalidOperationException($"Invalid transition from {order.Status} to {dto.Status} for {order.DeliveryType} orders.");

        return await _orderRepository.UpdateStatusAsync(id, dto.Status);
    }

    // Retrieves the active order for a user.
    public async Task<OrderDto?> GetActiveOrderForUserAsync(int userId)
    {
        var order = await _orderRepository.GetActiveOrderForUserAsync(userId);
        return order?.ToDto();
    }

    public async Task<IEnumerable<OrderDto>> GetHistoricOrdersForUserAsync(int userId)
    {
        var orders = await _orderRepository.GetHistoryForUserAsync(userId);
        return orders.Select(order => order.ToDto());
    }

    /// <summary>
    /// Finds the restaurant linked to the current user and returns its ID.
    /// </summary>
    private async Task<int> ResolveRestaurantIdForUserAsync(int currentUserId, UserRole currentUserRole)
    {
        if (currentUserRole == UserRole.Admin)
            throw new InvalidOperationException("Admin must use explicit admin reporting endpoints.");

        var restaurant = await _restaurantRepository.GetSingleByUserIdAsync(currentUserId)
            ?? throw new KeyNotFoundException("Restaurant profile not found for current user.");

        return restaurant.Id;
    }

    private static bool IsTerminal(OrderStatus status) =>
        status == OrderStatus.Delivered || status == OrderStatus.Cancelled;

    // Checks whether an order is allowed to move from its current status to the requested next status.
    // The valid flow is dependent on the delivery type.
    // Delivery orders: Pending -> Preparing -> OnTheWay -> Delivered
    // Pickup orders:   Pending -> Preparing -> ReadyForPickup -> Delivered
    // Orders can be cancelled unless they have already been delivered.
    private static bool IsValidTransition(DeliveryType deliveryType, OrderStatus currentStatus, OrderStatus nextStatus)
    {
        // Prevent updating an order to the same status.
        if (currentStatus == nextStatus)
            return false;

        // Allow cancellation from any status except Delivered.
        if (nextStatus == OrderStatus.Cancelled)
            return currentStatus != OrderStatus.Delivered;

        // Switch expression
        return deliveryType switch
        {
            DeliveryType.Delivery => currentStatus switch
            {
                OrderStatus.Pending => nextStatus == OrderStatus.Preparing,
                OrderStatus.Preparing => nextStatus == OrderStatus.OnTheWay,
                OrderStatus.OnTheWay => nextStatus == OrderStatus.Delivered,
                _ => false
            },
            DeliveryType.Pickup => currentStatus switch
            {
                OrderStatus.Pending => nextStatus == OrderStatus.Preparing,
                OrderStatus.Preparing => nextStatus == OrderStatus.ReadyForPickup,
                OrderStatus.ReadyForPickup => nextStatus == OrderStatus.Delivered,
                _ => false
            },
            _ => false
        };
    }
}
