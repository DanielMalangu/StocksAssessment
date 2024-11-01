namespace Stocks.Server.Services
{
    public interface IPricesService
    {
        public Task<string> getData(string symbol);
    }
}
