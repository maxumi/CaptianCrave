using System.Security.Claims;

namespace Backend.Services;


public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Returns a user id from claim assocatied with user
    /// </summary>
    /// <param name="user"></param>
    /// <returns></returns>
    public static int GetId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.Parse(id);
    }
}