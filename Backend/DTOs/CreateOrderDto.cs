namespace Backend.DTOs;

public class CreateOrderDto
{
    public int UserId { get; set; }

    public int RestaurantId { get; set; }

    public List<CreateOrderItemDto> Items { get; set; }
        = new();
}