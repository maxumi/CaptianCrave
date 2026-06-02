using Backend.Models;

namespace Backend.Repositories;

// Defines data access operations for restaurants.
public interface IRestaurantRepository
{
    // Returns all restaurants.
    Task<IEnumerable<Restaurant>> GetAllAsync();

    // Returns a restaurant by ID, or null if not found.
    Task<Restaurant?> GetByIdAsync(int id);

    // Returns all restaurants owned by the specified user.
    Task<IEnumerable<Restaurant>> GetByUserIdAsync(int userId);

    // Saves a new restaurant and returns it with the generated ID.
    Task<Restaurant> CreateAsync(Restaurant restaurant);
}
