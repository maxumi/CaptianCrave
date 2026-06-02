using Backend.Controllers;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Backend.Tests.Controllers;

public class MenuItemControllerTests
{
    private static (MenuItemsController controller, Mock<IMenuItemService> mockService) CreateController()
    {
        var mockService = new Mock<IMenuItemService>();
        var controller = new MenuItemsController(mockService.Object);
        return (controller, mockService);
    }

    // GetByRestaurant

    [Fact]
    public async Task GetByRestaurant_ReturnsOk()
    {
        var (controller, mockService) = CreateController();
        mockService.Setup(s => s.GetByRestaurantIdAsync(1)).ReturnsAsync([]);

        var result = await controller.GetByRestaurant(1);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetByRestaurant_ReturnsMenuItems()
    {
        var (controller, mockService) = CreateController();
        var items = new List<MenuItemDto>
        {
            new() { Id = 1, RestaurantId = 1, Name = "Burger", Price = 9.99m },
            new() { Id = 2, RestaurantId = 1, Name = "Fries", Price = 3.49m }
        };
        mockService.Setup(s => s.GetByRestaurantIdAsync(1)).ReturnsAsync(items);

        var result = await controller.GetByRestaurant(1) as OkObjectResult;

        Assert.Equal(items, result?.Value);
    }

    [Fact]
    public async Task GetByRestaurant_EmptyList_ReturnsOkWithEmptyCollection()
    {
        var (controller, mockService) = CreateController();
        mockService.Setup(s => s.GetByRestaurantIdAsync(99)).ReturnsAsync([]);

        var result = await controller.GetByRestaurant(99) as OkObjectResult;

        Assert.NotNull(result);
        Assert.Empty((IEnumerable<MenuItemDto>)result.Value!);
    }

    // Create

    [Fact]
    public async Task Create_ValidDto_ReturnsCreated()
    {
        var (controller, mockService) = CreateController();
        var dto = new CreateMenuItemDto { RestaurantId = 1, CategoryId = 2, Name = "Burger", Price = 9.99m };
        var created = new MenuItemDto { Id = 10, RestaurantId = 1, CategoryId = 2, Name = "Burger", Price = 9.99m };
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await controller.Create(dto);

        Assert.IsType<CreatedResult>(result);
    }

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedMenuItem()
    {
        var (controller, mockService) = CreateController();
        var dto = new CreateMenuItemDto { RestaurantId = 1, CategoryId = 2, Name = "Burger", Price = 9.99m };
        var created = new MenuItemDto { Id = 10, RestaurantId = 1, CategoryId = 2, Name = "Burger", Price = 9.99m };
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await controller.Create(dto) as CreatedResult;

        Assert.Equal(created, result?.Value);
    }

    [Fact]
    public async Task Create_InvalidModelState_ReturnsBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Name", "Required");

        var result = await controller.Create(new CreateMenuItemDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }
}
