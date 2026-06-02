using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CreateMenuItemDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Range(1, 9999)]
    public decimal Price { get; set; }

    public int RestaurantId { get; set; }
}