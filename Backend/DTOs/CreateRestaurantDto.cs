using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CreateRestaurantDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }
}