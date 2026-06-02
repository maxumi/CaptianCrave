using Backend.Controllers;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Backend.Tests.Controllers;

public class RestaurantControllerTests
{
    private static (RestaurantsController controller, Mock<IRestaurantService> mockService) CreateController()
    {
        var mockService = new Mock<IRestaurantService>();
        var controller = new RestaurantsController(mockService.Object);
        return (controller, mockService);
    }

    // GetAll

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        var (controller, mockService) = CreateController();
        mockService.Setup(s => s.GetAllAsync()).ReturnsAsync([]);

        var result = await controller.GetAll();

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetAll_ReturnsRestaurantList()
    {
        var (controller, mockService) = CreateController();
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
        var (controller, mockService) = CreateController();
        var restaurant = new RestaurantDto { Id = 1, Name = "Burger Palace", UserId = 1 };
        mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(restaurant);

        var result = await controller.GetById(1);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetById_ExistingId_ReturnsRestaurant()
    {
        var (controller, mockService) = CreateController();
        var restaurant = new RestaurantDto { Id = 1, Name = "Burger Palace", UserId = 1 };
        mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(restaurant);

        var result = await controller.GetById(1) as OkObjectResult;

        Assert.Equal(restaurant, result?.Value);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        var (controller, mockService) = CreateController();
        mockService.Setup(s => s.GetByIdAsync(99)).ReturnsAsync((RestaurantDto?)null);

        var result = await controller.GetById(99);

        Assert.IsType<NotFoundResult>(result);
    }

    // Create

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedAtAction()
    {
        var (controller, mockService) = CreateController();
        var dto = new CreateRestaurantDto { UserId = 1, Name = "New Place", Address = "123 Main St" };
        var created = new RestaurantDto { Id = 5, UserId = 1, Name = "New Place", Address = "123 Main St" };
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await controller.Create(dto);

        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedRestaurant()
    {
        var (controller, mockService) = CreateController();
        var dto = new CreateRestaurantDto { UserId = 1, Name = "New Place", Address = "123 Main St" };
        var created = new RestaurantDto { Id = 5, UserId = 1, Name = "New Place", Address = "123 Main St" };
        mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        var result = await controller.Create(dto) as CreatedAtActionResult;

        Assert.Equal(created, result?.Value);
    }

    [Fact]
    public async Task Create_InvalidModelState_ReturnsBadRequest()
    {
        var (controller, _) = CreateController();
        controller.ModelState.AddModelError("Name", "Required");

        var result = await controller.Create(new CreateRestaurantDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }
}
