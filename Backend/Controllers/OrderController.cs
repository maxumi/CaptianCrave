using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    // POST: api/orders
    [HttpPost]
    public IActionResult Create(CreateOrderDto dto)
    {
        // 1. Validate cart
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest("Cart cannot be empty");

        // 2. Check user exists
        var user = _db.Users.Find(dto.UserId);
        if (user == null)
            return BadRequest("User not found");

        // 3. Check restaurant exists
        var restaurant = _db.Restaurants.Find(dto.RestaurantId);
        if (restaurant == null)
            return BadRequest("Restaurant not found");

        var order = new Order
        {
            UserId = dto.UserId,
            RestaurantId = dto.RestaurantId,
            CreatedAt = DateTime.UtcNow,
            TotalPrice = 0
        };

        decimal total = 0;

        // 4. Loop items
        foreach (var item in dto.Items)
        {
            var menuItem = _db.MenuItems.Find(item.MenuItemId);

            if (menuItem == null)
                return BadRequest($"Menu item {item.MenuItemId} not found");

            if (item.Quantity <= 0)
                return BadRequest("Quantity must be greater than 0");

            var orderItem = new OrderItem
            {
                MenuItemId = menuItem.Id,
                Quantity = item.Quantity,
                Price = menuItem.Price
            };

            total += menuItem.Price * item.Quantity;

            order.OrderItems.Add(orderItem);
        }

        order.TotalPrice = total;

        _db.Orders.Add(order);
        _db.SaveChanges();

        return Ok(new
        {
            order.Id,
            order.UserId,
            order.RestaurantId,
            order.TotalPrice,
            order.CreatedAt
        });
    }

    // GET: api/orders/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var order = _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.User)
            .Include(o => o.Restaurant)
            .FirstOrDefault(o => o.Id == id);

        if (order == null)
            return NotFound();

        return Ok(new
        {
            order.Id,
            order.CreatedAt,
            order.TotalPrice,
            User = new
            {
                order.User.Id,
                order.User.Name,
                order.User.Email
            },
            Restaurant = new
            {
                order.Restaurant.Id,
                order.Restaurant.Name
            },
            Items = order.OrderItems.Select(i => new
            {
                i.MenuItemId,
                i.MenuItem.Name,
                i.Quantity,
                i.Price,
                LineTotal = i.Price * i.Quantity
            })
        });
    }
}