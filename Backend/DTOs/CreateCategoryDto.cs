using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CreateCategoryDto
{
    [Required]
    public int RestaurantId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
