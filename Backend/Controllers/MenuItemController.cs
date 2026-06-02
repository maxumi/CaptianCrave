using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

// Handles HTTP requests for menu item resources.
[ApiController]
[Route("api/[controller]")]
public class MenuItemsController(IMenuItemService menuItemService) : ControllerBase
{
    private readonly IMenuItemService _menuItemService = menuItemService;

    // Returns all menu items belonging to the specified restaurant.
    [HttpGet("by-restaurant/{restaurantId}")]
    public async Task<IActionResult> GetByRestaurant(int restaurantId)
    {
        var items = await _menuItemService.GetByRestaurantIdAsync(restaurantId);
        return Ok(items);
    }

    // Creates a new menu item and returns it with a 201 status.
    [HttpPost]
    public async Task<IActionResult> Create(CreateMenuItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _menuItemService.CreateAsync(dto);
        return Created(string.Empty, created);
    }
}