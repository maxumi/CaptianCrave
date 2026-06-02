using Backend.DTOs;

namespace Backend.Services;

// Defines business logic operations for restaurants.
public interface IRestaurantService
{
    // Returns all restaurants as DTOs.
    Task<IEnumerable<RestaurantDto>> GetAllAsync();

    // Returns a single restaurant DTO by ID, or null if not found.
    Task<RestaurantDto?> GetByIdAsync(int id);

    // Validates, creates, and returns the new restaurant as a DTO.
    Task<RestaurantDto> CreateAsync(CreateRestaurantDto dto);
}
