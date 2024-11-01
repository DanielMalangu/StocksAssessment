using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Stocks.Server.Areas.Identity.Data;
using Stocks.Server.Data;
using Stocks.Server.Models;
using Stocks.Server.Services;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("StocksServerContextConnection") ?? throw new InvalidOperationException("Connection string 'StocksServerContextConnection' not found.");

builder.Services.AddDbContext<StocksServerContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddDefaultIdentity<StocksServerUser>(options => options.SignIn.RequireConfirmedAccount = false).AddEntityFrameworkStores<StocksServerContext>().AddApiEndpoints();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description =
            "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

c.AddSecurityRequirement(new OpenApiSecurityRequirement()
{
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            },
            Scheme = "oauth2",
            Name = "Bearer",
            In = ParameterLocation.Header,

        },
        new List<string>()
    }
});
});

builder.Services.AddAuthentication(cfg =>
{
    cfg.DefaultAuthenticateScheme = IdentityConstants.BearerScheme;
    cfg.DefaultChallengeScheme = IdentityConstants.BearerScheme;
})
            .AddBearerToken(IdentityConstants.BearerScheme);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin()));
builder.Services.AddResponseCaching();
builder.Services.AddApplicationInsightsTelemetry();

//Dependecny Injection
builder.Services.AddScoped<IPricesService, PricesService>(c =>
{
    var config = builder.Configuration.GetSection("Vantage");
    var client = new HttpClient();
    client.BaseAddress = new Uri(config.GetSection("BaseUrl").Value);
    client.DefaultRequestHeaders.Add(config.GetSection("AuthHeader").Value, builder.Configuration["ApiKey"]);
    return new PricesService(client);
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapIdentityApi<StocksServerUser>();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.UseResponseCaching();

app.UseCors();

//app.MapRazorPages();

app.Run();