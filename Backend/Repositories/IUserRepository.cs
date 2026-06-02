using Backend.Models;

namespace Backend.Repositories;

// Defines the database operations for users
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<User> CreateAsync(User user);
}
