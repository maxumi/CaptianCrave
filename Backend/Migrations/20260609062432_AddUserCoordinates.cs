using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "latitude",
                table: "users",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "longitude",
                table: "users",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "address",
                table: "users");

            migrationBuilder.DropColumn(
                name: "latitude",
                table: "users");

            migrationBuilder.DropColumn(
                name: "longitude",
                table: "users");
        }
    }
}
