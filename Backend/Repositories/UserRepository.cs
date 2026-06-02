using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

// Handles all database queries for the users table
public class UserRepository(AppDbContext db) : IUserRepository
{
    // Returns the user with the given id, or null if not found
    public Task<User?> GetByIdAsync(int id) =>
        db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);

    // Returns the user with the given email, or null if not found
    public Task<User?> GetByEmailAsync(string email) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email);

    // Returns true if a user with that email already exists
    public Task<bool> EmailExistsAsync(string email) =>
        db.Users.AnyAsync(u => u.Email == email);

    // Saves the new user to the database and returns it with the generated Id
    public async Task<User> CreateAsync(User user)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }
}
