using Backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SampleController(AppDbContext db) : ControllerBase
{
    // GET api/sample
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(new[]
        {
            new { Id = 1, Name = "Test item" },
            new { Id = 2, Name = "Another item" }
        });
    }

    // GET api/sample/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        return Ok();
    }

    // POST api/sample
    [HttpPost]
    public IActionResult Create([FromBody] object body)
    {
        return CreatedAtAction(nameof(GetById), new { id = 0 }, body);
    }

    // PUT api/sample/{id}
    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] object body)
    {
        return NoContent();
    }

    // DELETE api/sample/{id}
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        return NoContent();
    }
}
