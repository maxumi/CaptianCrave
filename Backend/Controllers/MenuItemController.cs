using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public MenuItemsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_db.MenuItems.ToList());
    }

    [HttpPost]
    public IActionResult Create(CreateMenuItemDto dto)
    {
        var restaurant = _db.Restaurants.Find(dto.RestaurantId);

        if (restaurant == null)
            return BadRequest("Restaurant not found");

        var menuItem = new MenuItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            RestaurantId = dto.RestaurantId
        };

        _db.MenuItems.Add(menuItem);
        _db.SaveChanges();

        return Ok(menuItem);
    }
}