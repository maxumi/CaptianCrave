using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Data.Configurations;

public class RestaurantConfiguration : IEntityTypeConfiguration<Restaurant>
{
    public void Configure(EntityTypeBuilder<Restaurant> builder)
    {
        builder.ToTable("restaurants");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(r => r.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.Address)
            .HasColumnName("address")
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(r => r.Latitude)
            .HasColumnName("latitude")
            .IsRequired();

        builder.Property(r => r.Longitude)
            .HasColumnName("longitude")
            .IsRequired();

        builder.HasMany(r => r.MenuItems)
            .WithOne(m => m.Restaurant)
            .HasForeignKey(m => m.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}