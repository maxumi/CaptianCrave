using Backend.DTOs;

namespace Backend.Services;

// Defines business logic operations for menu items.
public interface IMenuItemService
{
    // Returns all menu items for the given restaurant as DTOs.
    Task<IEnumerable<MenuItemDto>> GetByRestaurantIdAsync(int restaurantId);

    // Validates, creates, and returns the new menu item as a DTO.
    Task<MenuItemDto> CreateAsync(CreateMenuItemDto dto);
}
