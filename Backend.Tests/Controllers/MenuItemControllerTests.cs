using Backend.Controllers;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace Backend.Tests.Controllers;

public class MenuItemControllerTests
{
    private static (MenuItemsController controller, Mock<IMenuItemService> mockService) CreateController()
    {
        var mockService = new Mock<IMenuItemService>();
        var mockRestaurantService = new Mock<IRestaurantService>();
        var controller = new MenuItemsController(mockService.Object, mockRestaurantService.Object);
        var user = new ClaimsPrincipal(new ClaimsIdentity([]));
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
        return (controller, mockService);
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
