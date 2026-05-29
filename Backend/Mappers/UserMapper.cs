using Backend.DTOs.Auth;
using Backend.Models;

namespace Backend.Mappers;

// Converts between User entities and auth DTOs
public static class UserMapper
{
    // Maps a User and a JWT token to the response sent back to the client
    public static AuthResponseDto ToAuthResponseDto(this User user, string token) =>
        new()
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            Token = token
        };

    // Maps a register request to a new User object (password is hashed separately in AuthService)
    public static User ToUser(this RegisterRequestDto dto) =>
        new()
        {
            Name = dto.Name,
            Email = dto.Email,
            Role = dto.Role
        };
}
