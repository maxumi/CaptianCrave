using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_db.Restaurants.ToList());
    }

    [HttpPost]
    public IActionResult Create(CreateRestaurantDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var restaurant = new Restaurant
        {
            Name = dto.Name,
            Address = dto.Address,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude
        };

        _db.Restaurants.Add(restaurant);
        _db.SaveChanges();

        return Ok(restaurant);
    }

    [HttpGet("{id}/menu-items")]
    public IActionResult GetMenuItems(int id)
    {
        var menuItems = _db.MenuItems
            .Where(m => m.RestaurantId == id)
            .ToList();

        return Ok(menuItems);
    }
}