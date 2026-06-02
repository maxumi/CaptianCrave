using Backend.DTOs;
using Backend.Mappers;
using Backend.Repositories;

namespace Backend.Services;

// Handles business logic for restaurant operations.
public class RestaurantService(IRestaurantRepository restaurantRepository) : IRestaurantService
{
    private readonly IRestaurantRepository _restaurantRepository = restaurantRepository;

    // Retrieves all restaurants and maps them to DTOs.
    public async Task<IEnumerable<RestaurantDto>> GetAllAsync()
    {
        var restaurants = await _restaurantRepository.GetAllAsync();
        return restaurants.Select(r => r.ToDto());
    }

    // Retrieves a restaurant by ID and maps it to a DTO.
    public async Task<RestaurantDto?> GetByIdAsync(int id)
    {
        var restaurant = await _restaurantRepository.GetByIdAsync(id);
        return restaurant?.ToDto();
    }

    // Maps the DTO to a model, saves it, and returns the created restaurant as a DTO.
    public async Task<RestaurantDto> CreateAsync(CreateRestaurantDto dto)
    {
        var restaurant = dto.ToRestaurant();
        var created = await _restaurantRepository.CreateAsync(restaurant);
        return created.ToDto();
    }
}
