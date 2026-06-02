using Backend.Controllers;
using Backend.DTOs.Auth;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Backend.Tests.Controllers;

public class AuthControllerTests
{
    private static (AuthController controller, Mock<IAuthService> mockService) CreateController()
    {
        var mockService = new Mock<IAuthService>();
        var controller = new AuthController(mockService.Object);
        return (controller, mockService);
    }

    // Register

    [Fact]
    public async Task Register_ValidDto_ReturnsCreatedAtAction()
    {
        var (controller, mockService) = CreateController();
        var dto = new RegisterRequestDto { Name = "Alice", Email = "alice@example.com", Password = "password123" };
        var response = new AuthResponseDto { Id = 1, Name = "Alice", Email = "alice@example.com", Role = "Customer", Token = "token" };

        mockService.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(response);

        var result = await controller.Register(dto);

        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public async Task Register_ValidDto_ReturnsAuthResponse()
    {
        var (controller, mockService) = CreateController();
        var dto = new RegisterRequestDto { Name = "Alice", Email = "alice@example.com", Password = "password123" };
        var response = new AuthResponseDto { Id = 1, Name = "Alice", Email = "alice@example.com", Role = "Customer", Token = "token" };

        mockService.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(response);

        var result = await controller.Register(dto) as CreatedAtActionResult;

        Assert.Equal(response, result?.Value);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        var (controller, mockService) = CreateController();
        var dto = new RegisterRequestDto { Name = "Alice", Email = "alice@example.com", Password = "password123" };

        mockService.Setup(s => s.RegisterAsync(dto)).ThrowsAsync(new InvalidOperationException("Email is already in use."));

        var result = await controller.Register(dto);

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task Register_InvalidModelState_ReturnsBadRequest()
    {
        var (controller, mockService) = CreateController();
        controller.ModelState.AddModelError("Email", "Required");

        var result = await controller.Register(new RegisterRequestDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // Login

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOk()
    {
        var (controller, mockService) = CreateController();
        var dto = new LoginRequestDto { Email = "alice@example.com", Password = "password123" };
        var response = new AuthResponseDto { Id = 1, Name = "Alice", Email = "alice@example.com", Role = "Customer", Token = "token" };

        mockService.Setup(s => s.LoginAsync(dto)).ReturnsAsync(response);

        var result = await controller.Login(dto);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsAuthResponse()
    {
        var (controller, mockService) = CreateController();
        var dto = new LoginRequestDto { Email = "alice@example.com", Password = "password123" };
        var response = new AuthResponseDto { Id = 1, Name = "Alice", Email = "alice@example.com", Role = "Customer", Token = "token" };

        mockService.Setup(s => s.LoginAsync(dto)).ReturnsAsync(response);

        var result = await controller.Login(dto) as OkObjectResult;

        Assert.Equal(response, result?.Value);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        var (controller, mockService) = CreateController();
        var dto = new LoginRequestDto { Email = "alice@example.com", Password = "wrongpassword" };

        mockService.Setup(s => s.LoginAsync(dto)).ThrowsAsync(new UnauthorizedAccessException());

        var result = await controller.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_InvalidModelState_ReturnsBadRequest()
    {
        var (controller, mockService) = CreateController();
        controller.ModelState.AddModelError("Email", "Required");

        var result = await controller.Login(new LoginRequestDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }
}
