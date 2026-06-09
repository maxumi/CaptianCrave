using System.Security.Claims;

namespace Backend.Services;

public static class ClaimsPrincipalExtensions
{
    public static int GetId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.Parse(id);
    }
}