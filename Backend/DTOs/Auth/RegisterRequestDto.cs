using System.ComponentModel.DataAnnotations;
using Backend.Models.Enums;

namespace Backend.DTOs.Auth;

// The data a user sends when creating a new account
public class RegisterRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Customer;
}
