using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RemapLegacyOrderStatusesForWorkflowV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE orders
                SET status = 'Preparing'
                WHERE status = 'Confirmed';

                UPDATE orders
                SET status = 'ReadyForPickup'
                WHERE status = 'Ready';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE orders
                SET status = 'Confirmed'
                WHERE status = 'Preparing';

                UPDATE orders
                SET status = 'Ready'
                WHERE status = 'ReadyForPickup';
                """);
        }
    }
}
