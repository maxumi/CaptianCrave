namespace Backend.Models;

public class Restaurant
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public ICollection<MenuItem> MenuItems { get; set; }
        = new List<MenuItem>();
}