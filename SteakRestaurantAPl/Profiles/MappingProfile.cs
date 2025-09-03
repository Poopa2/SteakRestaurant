using AutoMapper;
using SteakRestaurantAPI.DTOs;
using SteakRestaurantAPl.Models;

namespace SteakRestaurantAPl.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<ProductCreateDTO, Product>();
            CreateMap<ProductUpdateDTO, Product>();

            CreateMap<OrderCreateDTO, Order>();
            CreateMap<OrderUpdateDTO, Order>();

            CreateMap<OrderItemCreateDTO, OrderItem>();
            CreateMap<OrderItemUpdateDTO, OrderItem>();

            CreateMap<CustomizationCreateDTO, Customization>();
            CreateMap<CustomizationUpdateDTO, Customization>();

         
            CreateMap<PaymentCreateDTO, Payment>();

          
        }
    }
}
