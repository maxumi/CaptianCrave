using Backend.Models;

namespace Backend.Services;

// Defines the operation for generating a JWT token
public interface ITokenService
{
    string GenerateToken(User user);
}
