using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CreateOrderDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int RestaurantId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Cart cannot be empty.")]
    public List<CreateOrderItemDto> Items { get; set; } = [];
}