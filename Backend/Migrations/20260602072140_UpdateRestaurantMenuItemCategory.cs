using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRestaurantMenuItemCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "restaurants",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "restaurants",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "restaurants",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "restaurants",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "user_id",
                table: "restaurants",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "category_id",
                table: "menu_items",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "menu_items",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_available",
                table: "menu_items",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    restaurant_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categories", x => x.id);
                    table.ForeignKey(
                        name: "FK_categories_restaurants_restaurant_id",
                        column: x => x.restaurant_id,
                        principalTable: "restaurants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_restaurants_user_id",
                table: "restaurants",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_menu_items_category_id",
                table: "menu_items",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_categories_restaurant_id",
                table: "categories",
                column: "restaurant_id");

            migrationBuilder.AddForeignKey(
                name: "FK_menu_items_categories_category_id",
                table: "menu_items",
                column: "category_id",
                principalTable: "categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_restaurants_users_user_id",
                table: "restaurants",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_menu_items_categories_category_id",
                table: "menu_items");

            migrationBuilder.DropForeignKey(
                name: "FK_restaurants_users_user_id",
                table: "restaurants");

            migrationBuilder.DropTable(
                name: "categories");

            migrationBuilder.DropIndex(
                name: "IX_restaurants_user_id",
                table: "restaurants");

            migrationBuilder.DropIndex(
                name: "IX_menu_items_category_id",
                table: "menu_items");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "description",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "image_url",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "category_id",
                table: "menu_items");

            migrationBuilder.DropColumn(
                name: "image_url",
                table: "menu_items");

            migrationBuilder.DropColumn(
                name: "is_available",
                table: "menu_items");
        }
    }
}
