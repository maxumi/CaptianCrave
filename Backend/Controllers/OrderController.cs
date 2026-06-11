using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    private readonly IOrderService _orderService = orderService;

    // POST: api/orders — creates a new order for an authenticated customer.
    [HttpPost]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var created = await _orderService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/orders/{id} — returns the full order detail for any authenticated user.
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order is null)
            return NotFound();

        return Ok(order);
    }

    // GET: api/orders/active — returns the active order for the current user.
    [HttpGet("customer/active")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetActiveOrderForCustomer()
    {
        var userId = User.GetId();
        var order = await _orderService.GetActiveOrderForUserAsync(userId);
        if (order is null)
            return NotFound();

        return Ok(order);
    }

    // Backward-compatible route alias for existing clients.
    [HttpGet("active")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetActiveOrder() => await GetActiveOrderForCustomer();

    [HttpGet("customer/history")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetCustomerHistory()
    {
        var userId = User.GetId();
        var orders = await _orderService.GetHistoricOrdersForUserAsync(userId);
        return Ok(orders);
    }

    [HttpGet("restaurant/active")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> GetRestaurantActiveOrders()
    {
        var userId = User.GetId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        try
        {
            var orders = await _orderService.GetRestaurantActiveOrdersAsync(userId, role);
            return Ok(orders);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("restaurant/history")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> GetRestaurantHistoricOrders()
    {
        var userId = User.GetId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        try
        {
            var orders = await _orderService.GetRestaurantHistoricOrdersAsync(userId, role);
            return Ok(orders);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PATCH: api/orders/{id}/status")]
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.GetId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        bool updated;
        try
        {
            updated = await _orderService.UpdateStatusAsync(id, dto, userId, role);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        if (!updated)
            return NotFound();

        var order = await _orderService.GetByIdAsync(id);

        if (order is null)
            return NotFound();

        return Ok(order);
    }
}