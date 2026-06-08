using System.ComponentModel.DataAnnotations;
using Backend.Models.Enums;

namespace Backend.DTOs;

public class UpdateOrderStatusDto
{
    [Required]
    public OrderStatus Status { get; set; }
}
