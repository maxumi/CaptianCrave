# Backend Changelog

All notable changes to the backend are documented here.
Format: `[Date] - Summary` followed by details.

---

## [2026-06-09] - Test suite overhaul: all controllers covered

### Added
- `OrderControllerTests` - full unit test coverage for `OrderController`:
  - `GetById_ExistingId_ReturnsOk`, `GetById_ExistingId_ReturnsCorrectStatus`, `GetById_ExistingId_ReturnsOrderDto`, `GetById_NonExistingId_ReturnsNotFound`
  - `Create_ValidDto_ReturnsCreatedAtAction`, `Create_ValidDto_ReturnsCreatedOrder`, `Create_ValidDto_PointsToGetByIdRoute`, `Create_InvalidModelState_ReturnsBadRequest`, `Create_UnknownUser_ReturnsBadRequest`, `Create_UnknownRestaurant_ReturnsBadRequest`, `Create_UnknownMenuItem_ReturnsBadRequest`
  - `UpdateStatus_ExistingOrder_ReturnsNoContent`, `UpdateStatus_NonExistingOrder_ReturnsNotFound`, `UpdateStatus_InvalidModelState_ReturnsBadRequest`
  - `[Theory]` - `UpdateStatus_EachValidStatus_ReturnsNoContent` (covers all 6 `OrderStatus` values)
- `RestaurantControllerTests` - added `GetMenuItems_ReturnsOk`, `GetMenuItems_ReturnsItems`, `GetMenuItems_EmptyList_ReturnsOkWithEmptyCollection` for the nested route `GET /api/restaurants/{id}/menu-items`

### Changed
- `MenuItemControllerTests` - removed stale `GetByRestaurant` tests (endpoint was moved to `RestaurantsController`); updated `CreateController` helper to pass both `IMenuItemService` and `IRestaurantService` and to supply a mock `HttpContext` so `User.IsInRole` resolves correctly
- `RestaurantControllerTests` - updated `CreateController` helper to pass both `IRestaurantService` and `IMenuItemService` (matches controller constructor)
- `OrderControllerTests` - `MakeOrderDto` helper updated to include `Status`, `DeliveryType`, `DeliveryAddress`, `UpdatedAt`; `MakeCreateDto` updated to include `DeliveryType` and `DeliveryAddress`

---

## [2026-06-08] - Order status, delivery type, and PATCH endpoint

### Added
- `OrderStatus` enum: `Pending`, `Confirmed`, `Preparing`, `Ready`, `Delivered`, `Cancelled`
- `DeliveryType` enum: `Delivery`, `Pickup`
- `Order` model - new fields: `Status`, `DeliveryType`, `DeliveryAddress`, `UpdatedAt`
- `UpdateOrderStatusDto` - payload for the status update endpoint
- `PATCH /api/orders/{id}/status` - restricted to `Restaurant` and `Admin` roles; returns `204 No Content`
- `IOrderRepository.UpdateStatusAsync` - updates status and `updated_at` in the database
- Migration `AddOrderStatusAndDelivery` - adds `status`, `delivery_type`, `delivery_address`, `updated_at` columns to the `orders` table

### Changed
- `CreateOrderDto` - added `DeliveryType` (required) and `DeliveryAddress` (required when type is `Delivery`, validated via `IValidatableObject`)
- `OrderDto` - added `Status`, `DeliveryType`, `DeliveryAddress`, `UpdatedAt` fields
- `OrderMapper.ToDto` - maps new fields from the `Order` entity
- `OrderService.CreateAsync` - maps `DeliveryType` and `DeliveryAddress` from the DTO onto the new order
- `OrderService` - implements `UpdateStatusAsync`, delegating to the repository
- `OrderConfiguration` - Fluent API configuration for all new columns (string conversion, max lengths, defaults)

---

## [2026-06-05] - Route change: nested menu-items under restaurants

### Changed
- `GET /api/menuitems/restaurant/{restaurantId}` removed from `MenuItemsController`
- `GET /api/restaurants/{id}/menu-items` added to `RestaurantsController` (sprint spec compliant)
- `RestaurantsController` now injects `IMenuItemService` alongside `IRestaurantService`

---

## [2026-06-04] - Orders clean architecture + Swagger JWT

### Added
- `OrderDto`, `OrderItemDto` - response DTOs for orders
- `OrderMapper` - `ToDto()` for `Order`/`OrderItem`, `ToOrderItem()` for create
- `IOrderRepository` + `OrderRepository` - EF Core data access with full navigation property loading
- `IOrderService` + `OrderService` - business logic: validates user, restaurant, and menu items before creating an order
- `UpdateOrderStatusDto` placeholder (finalised 2026-06-08)
- Migration `AddOrdersTables` - creates `orders` and `order_items` tables
- Swagger JWT support - `AddSecurityDefinition` and `AddSecurityRequirement` using `OpenApiSecurityScheme` (Microsoft.OpenApi v2.4.1)

### Changed
- `OrdersController` - refactored from direct `AppDbContext` usage to `IOrderService`; `POST` now returns `CreatedAtAction`
- `CreateOrderDto` - added `[Required]` and `[MinLength(1)]` validation
- `CreateOrderItemDto` - added `[Required]` and `[Range(1, int.MaxValue)]` validation
- `IUserRepository` + `UserRepository` - added `GetByIdAsync`

---

## [2026-06-03] - Role-based endpoint protection

### Changed
- `POST /api/restaurants` - requires `Restaurant` or `Admin` role
- `POST /api/menuitems` - requires `Restaurant` or `Admin` role
- `POST /api/categories` - requires `Restaurant` or `Admin` role
- `POST /api/orders` - requires `Customer` or `Admin` role
- `GET /api/orders/{id}` - requires any authenticated user
- All browse/read endpoints remain public

---

## [2026-06-02] - Restaurant, MenuItem, Category clean architecture

### Added
- `RestaurantDto`, `CreateRestaurantDto`, `MenuItemDto`, `CreateMenuItemDto`, `CategoryDto`, `CreateCategoryDto`
- `RestaurantMapper`, `MenuItemMapper`, `CategoryMapper`
- `IRestaurantRepository` + `RestaurantRepository`
- `IMenuItemRepository` + `MenuItemRepository`
- `ICategoryRepository` + `CategoryRepository`
- `IRestaurantService` + `RestaurantService`
- `IMenuItemService` + `MenuItemService`
- `ICategoryService` + `CategoryService`
- Migrations: `AddRestaurantAndMenuItem`, `AddRestaurantCoordinates`, `UpdateRestaurantMenuItemCategory`, `AddOrders`
- Fluent API configurations for all entities under `Data/Configurations/`

---

## [2026-05-29] - User schema update

### Changed
- Migration `UpdateUserSchema` - schema adjustments to the `users` table

---

## [2026-05-28] - User model and authentication

### Added
- `User` model with `UserRole` enum (`Customer`, `Restaurant`, `Admin`)
- `AuthController` - `POST /api/auth/register`, `POST /api/auth/login`
- `IAuthService` + `AuthService` - BCrypt password hashing and verification
- `ITokenService` + `TokenService` - JWT generation with `sub`, `email`, `role` claims
- `RegisterRequestDto`, `LoginRequestDto`, `AuthResponseDto`
- Migration `user` - creates the `users` table

---

## [2026-05-26] - Initial project setup

### Added
- ASP.NET Core 10 Web API project scaffolded
- EF Core with SQL Server and LocalDB connection string
- JWT Bearer authentication wired in `Program.cs`
- Migration `InitialCreate`
