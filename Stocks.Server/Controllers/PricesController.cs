using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocks.Server.Services;

namespace Stocks.Server.Controllers
{
    
    [ApiController]
    [Route("[controller]")]
    //[Authorize]
    public class PricesController : ControllerBase
    {
        private readonly ILogger<PricesController> _logger;
        IPricesService _pricesService;

        public PricesController(ILogger<PricesController> logger, IPricesService pricesService) 
        {
            _logger = logger;
            _pricesService = pricesService;
        }

        [HttpGet]
        [ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "*" })]
        public Task<string> Get([FromQuery] string symbol)
        {
            return _pricesService.getData(symbol);
        }
    }
}
