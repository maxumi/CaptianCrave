using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

// Handles HTTP requests for menu item resources.
[ApiController]
[Route("api/[controller]")]
public class MenuItemsController(IMenuItemService menuItemService) : ControllerBase
{
    private readonly IMenuItemService _menuItemService = menuItemService;

    // Creates a new menu item and returns it with a 201 status.
    [HttpPost]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> Create(CreateMenuItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _menuItemService.CreateAsync(dto);
        return Created(string.Empty, created);
    }
}