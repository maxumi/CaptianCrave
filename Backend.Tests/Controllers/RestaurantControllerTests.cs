using Backend.Controllers;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Backend.Tests.Controllers;

public class RestaurantControllerTests
{
    private static (RestaurantsController controller, Mock<IRestaurantService> mockService, Mock<IMenuItemService> mockMenuItemService) CreateController()
    {
        var mockService = new Mock<IRestaurantService>();
        var mockMenuItemService = new Mock<IMenuItemService>();
        var controller = new RestaurantsController(mockService.Object, mockMenuItemService.Object);
        return (controller, mockService, mockMenuItemService);
    }

    // GetAll

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        var (controller, mockService, _) = CreateController();
        mockService.Setup(s => s.GetAllAsync()).ReturnsAsync([]);

        var result = await controller.GetAll();

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetAll_ReturnsRestaurantList()
    {
        var (controller, mockService, _) = CreateController();
        var restaurants = new List<RestaurantDto>
        {
            new() { Id = 1, Name = "Burger Palace", UserId = 1 },
            new() { Id = 2, Name = "Pizza Town", UserId = 2 }
        };
        mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(restaurants);

        var result = await controller.GetAll() as OkObjectResult;

        Assert.Equal(restaurants, result?.Value);
    }

    // GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        var (controller, mockService, _) = CreateController();
        var restaurant = new RestaurantDto { Id = 1, Name = "Burger Palace", UserId = 1 };
        mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(restaurant);

        var result = await controller.GetById(1);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetById_ExistingId_ReturnsRestaurant()
    {
        var (controller, mockService, _) = CreateController();
        var restaurant = new RestaurantDto { Id = 1, Name = "Burger Palace", UserId = 1 };
        mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(restaurant);

        var result = await controller.GetById(1) as OkObjectResult;

        Assert.Equal(restaurant, result?.Value);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        var (controller, mockService, _) = CreateController();
        mockService.Setup(s => s.GetByIdAsync(99)).ReturnsAsync((RestaurantDto?)null);

        var result = await controller.GetById(99);

        Assert.IsType<NotFoundResult>(result);
    }

    // Create

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedAtAction()
    {
        var (controller, mockService, _) = CreateController();
        var dto = new CreateRestaurantDto { UserId = 1, Name = "New Place", Address = "123 Main St" };
        var created = new RestaurantDto { Id = 5, UserId = 1, Name = "New Place", Address = "123 Main St" };
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await controller.Create(dto);

        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedRestaurant()
    {
        var (controller, mockService, _) = CreateController();
        var dto = new CreateRestaurantDto { UserId = 1, Name = "New Place", Address = "123 Main St" };
        var created = new RestaurantDto { Id = 5, UserId = 1, Name = "New Place", Address = "123 Main St" };
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await controller.Create(dto) as CreatedAtActionResult;

        Assert.Equal(created, result?.Value);
    }

    [Fact]
    public async Task Create_InvalidModelState_ReturnsBadRequest()
    {
        var (controller, _, _) = CreateController();
        controller.ModelState.AddModelError("Name", "Required");

        var result = await controller.Create(new CreateRestaurantDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // GetMenuItems

    [Fact]
    public async Task GetMenuItems_ReturnsOk()
    {
        var (controller, _, mockMenuItemService) = CreateController();
        mockMenuItemService.Setup(s => s.GetByRestaurantIdAsync(1)).ReturnsAsync([]);

        var result = await controller.GetMenuItems(1);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetMenuItems_ReturnsItems()
    {
        var (controller, _, mockMenuItemService) = CreateController();
        var items = new List<MenuItemDto>
        {
            new() { Id = 1, RestaurantId = 1, Name = "Burger", Price = 9.99m },
            new() { Id = 2, RestaurantId = 1, Name = "Fries", Price = 3.49m }
        };
        mockMenuItemService.Setup(s => s.GetByRestaurantIdAsync(1)).ReturnsAsync(items);

        var result = await controller.GetMenuItems(1) as OkObjectResult;

        Assert.Equal(items, result?.Value);
    }

    [Fact]
    public async Task GetMenuItems_EmptyList_ReturnsOkWithEmptyCollection()
    {
        var (controller, _, mockMenuItemService) = CreateController();
        mockMenuItemService.Setup(s => s.GetByRestaurantIdAsync(99)).ReturnsAsync([]);

        var result = await controller.GetMenuItems(99) as OkObjectResult;

        Assert.NotNull(result);
        Assert.Empty((IEnumerable<MenuItemDto>)result.Value!);
    }
}
