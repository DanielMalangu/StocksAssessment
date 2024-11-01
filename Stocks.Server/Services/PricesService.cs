using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;
using System.Web;

namespace Stocks.Server.Services
{

    public class PricesService : IPricesService
    {
       // private readonly IHttpClientFactory _factory;
        private readonly HttpClient client;

        public PricesService(HttpClient httpClient)
        {
            client =  httpClient;
        }

        public async Task<string> getData(string symbol)
        {
            var query = new Dictionary<string, string>
            {
                ["function"] = "TIME_SERIES_DAILY",
                ["symbol"] = symbol,
                ["outputsize"] = "compact",
                ["datatype"] = "json",  
            };
            

            var result = await client.GetAsync(QueryHelpers.AddQueryString("/query", query));
            var json = await result.Content.ReadAsStringAsync();


            var check = JsonConvert.DeserializeObject(json);

            return json;
        }
    }
}
