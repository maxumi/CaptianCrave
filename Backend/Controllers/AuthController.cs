using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto registerDto)
    {
        if (registerDto == null)
            return BadRequest("Invalid data");

        // tjek om email allerede findes
        var existingUser = _db.Users.FirstOrDefault(u => u.Email == registerDto.Email);

        if (existingUser != null)
            return BadRequest("User already exists");

        var user = new User
        {
            Name = registerDto.Name,
            Email = registerDto.Email,
            PasswordHash = registerDto.Password
        };

        _db.Users.Add(user);
        _db.SaveChanges();

        return Ok(new
        {
            message = "User created successfully"
        });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto loginDto)
    {
        if (loginDto == null)
            return BadRequest("Invalid data");

        var user = _db.Users.FirstOrDefault(u =>
            u.Email == loginDto.Email &&
            u.PasswordHash == loginDto.Password);

        if (user == null)
            return Unauthorized("Wrong email or password");

        return Ok(new
        {
            message = "Login successful",
            userId = user.Id,
            name = user.Name
        });
    }
}