using Backend.Controllers;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Backend.Tests.Controllers;

public class OrderControllerTests
{
    private static (OrdersController controller, Mock<IOrderService> mockService) CreateController()
    {
        var mockService = new Mock<IOrderService>();
        var controller = new OrdersController(mockService.Object);
        return (controller, mockService);
    }

    private static OrderDto MakeOrderDto(int id = 1) => new()
    {
        Id = id,
        UserId = 10,
        UserName = "Alice",
        UserEmail = "alice@example.com",
        RestaurantId = 5,
        RestaurantName = "Burger Palace",
        TotalPrice = 23.97m,
        CreatedAt = new DateTime(2026, 6, 1),
        Items =
        [
            new OrderItemDto { Id = 1, MenuItemId = 3, MenuItemName = "Burger", Quantity = 2, Price = 9.99m },
            new OrderItemDto { Id = 2, MenuItemId = 7, MenuItemName = "Fries",  Quantity = 1, Price = 3.99m }
        ]
    };

    private static CreateOrderDto MakeCreateDto() => new()
    {
        UserId = 10,
        RestaurantId = 5,
        Items =
        [
            new CreateOrderItemDto { MenuItemId = 3, Quantity = 2 },
            new CreateOrderItemDto { MenuItemId = 7, Quantity = 1 }
        ]
    };

    // GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        var (controller, mockService) = CreateController();
        mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(MakeOrderDto());

        var result = await controller.GetById(1);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetById_ExistingId_ReturnsOrderDto()
    {
        var (controller, mockService) = CreateController();
        var dto = MakeOrderDto();
        mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(dto);

        var result = await controller.GetById(1) as OkObjectResult;

        Assert.Equal(dto, result?.Value);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        var (controller, mockService) = CreateController();
        mockService.Setup(s => s.GetByIdAsync(99)).ReturnsAsync((OrderDto?)null);

        var result = await controller.GetById(99);

        Assert.IsType<NotFoundResult>(result);
    }

    // Create

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedAtAction()
    {
        var (controller, mockService) = CreateController();
        var dto = MakeCreateDto();
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(MakeOrderDto());

        var result = await controller.Create(dto);

        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedOrder()
    {
        var (controller, mockService) = CreateController();
        var dto = MakeCreateDto();
        var created = MakeOrderDto();
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await controller.Create(dto) as CreatedAtActionResult;

        Assert.Equal(created, result?.Value);
    }

    [Fact]
    public async Task Create_ValidDto_PointsToGetByIdRoute()
    {
        var (controller, mockService) = CreateController();
        var dto = MakeCreateDto();
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(MakeOrderDto(id: 7));

        var result = await controller.Create(dto) as CreatedAtActionResult;

        Assert.Equal(nameof(controller.GetById), result?.ActionName);
        Assert.Equal(7, ((dynamic)result!.RouteValues!["id"]!));
    }

    [Fact]
    public async Task Create_InvalidModelState_ReturnsBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Items", "Required");

        var result = await controller.Create(new CreateOrderDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Create_UnknownUser_ReturnsBadRequest()
    {
        var (controller, mockService) = CreateController();
        var dto = MakeCreateDto();
        mockService.Setup(s => s.CreateAsync(dto))
            .ThrowsAsync(new KeyNotFoundException("User 10 not found."));

        var result = await controller.Create(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Create_UnknownRestaurant_ReturnsBadRequest()
    {
        var (controller, mockService) = CreateController();
        var dto = MakeCreateDto();
        mockService.Setup(s => s.CreateAsync(dto))
            .ThrowsAsync(new KeyNotFoundException("Restaurant 5 not found."));

        var result = await controller.Create(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Create_UnknownMenuItem_ReturnsBadRequest()
    {
        var (controller, mockService) = CreateController();
        var dto = MakeCreateDto();
        mockService.Setup(s => s.CreateAsync(dto))
            .ThrowsAsync(new KeyNotFoundException("Menu item 3 not found."));

        var result = await controller.Create(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }
}
