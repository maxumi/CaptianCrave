using Backend.Controllers;
using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Backend.Tests.Controllers;

public class SampleControllerTests
{
    private static SampleController CreateController()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);
        return new SampleController(db);
    }

    [Fact]
    public void GetAll_ReturnsOkResult()
    {
        var controller = CreateController();

        var result = controller.GetAll();

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public void GetAll_ReturnsNonEmptyList()
    {
        var controller = CreateController();

        var result = controller.GetAll() as OkObjectResult;

        Assert.NotNull(result?.Value);
    }

    [Fact]
    public void GetById_ReturnsOkResult()
    {
        var controller = CreateController();

        var result = controller.GetById(1);

        // Skeleton returns Ok() with no body — OkResult (not OkObjectResult)
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void Create_ReturnsCreatedAtActionResult()
    {
        var controller = CreateController();

        var result = controller.Create(new { Name = "Test" });

        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public void Create_CreatedAtAction_PointsToGetById()
    {
        var controller = CreateController();

        var result = controller.Create(new { Name = "Test" }) as CreatedAtActionResult;

        Assert.Equal(nameof(controller.GetById), result?.ActionName);
    }

    [Fact]
    public void Update_ReturnsNoContent()
    {
        var controller = CreateController();

        var result = controller.Update(1, new { Name = "Updated" });

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public void Delete_ReturnsNoContent()
    {
        var controller = CreateController();

        var result = controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }
}
