using Backend.DTOs;
using Backend.Mappers;
using Backend.Repositories;

namespace Backend.Services;

// Handles business logic for menu item operations.
public class MenuItemService(IMenuItemRepository menuItemRepository) : IMenuItemService
{
    private readonly IMenuItemRepository _menuItemRepository = menuItemRepository;

    // Retrieves all menu items for a restaurant and maps them to DTOs.
    public async Task<IEnumerable<MenuItemDto>> GetByRestaurantIdAsync(int restaurantId)
    {
        var items = await _menuItemRepository.GetByRestaurantIdAsync(restaurantId);
        return items.Select(m => m.ToDto());
    }

    // Maps the DTO to a model, saves it, and returns the created menu item as a DTO.
    public async Task<MenuItemDto> CreateAsync(CreateMenuItemDto dto)
    {
        var menuItem = dto.ToMenuItem();
        var created = await _menuItemRepository.CreateAsync(menuItem);
        return created.ToDto();
    }
}
