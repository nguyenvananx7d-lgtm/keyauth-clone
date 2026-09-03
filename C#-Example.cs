using System;
using System.Threading.Tasks;
using KeyAuth;

class Program
{
    static async Task Main(string[] args)
    {
        // Initialize KeyAuth API
        // Replace with your Application Name and Owner ID from dashboard
        var KeyAuthApp = new API(
            appName: "AN",  // Your app name from dashboard
            ownerID: "1",   // Your owner ID from dashboard
            apiUrl: "https://keyauth-website.onrender.com"
        );

        Console.WriteLine("Initializing...");
        if (!await KeyAuthApp.Init())
        {
            Console.WriteLine("Failed to initialize!");
            Console.ReadKey();
            return;
        }

        Console.WriteLine("Initialized successfully!");
        Console.WriteLine("\n=== KeyAuth Example ===");
        Console.WriteLine("1. Login");
        Console.WriteLine("2. Register");
        Console.WriteLine("3. Check License");
        Console.Write("\nChoose option: ");
        
        string choice = Console.ReadLine();

        switch (choice)
        {
            case "1":
                await LoginExample(KeyAuthApp);
                break;
            case "2":
                await RegisterExample(KeyAuthApp);
                break;
            case "3":
                await LicenseExample(KeyAuthApp);
                break;
            default:
                Console.WriteLine("Invalid option!");
                break;
        }

        Console.WriteLine("\nPress any key to exit...");
        Console.ReadKey();
    }

    static async Task LoginExample(API KeyAuthApp)
    {
        Console.Write("\nUsername: ");
        string username = Console.ReadLine();

        Console.Write("Password: ");
        string password = Console.ReadLine();

        Console.WriteLine("\nLogging in...");
        if (await KeyAuthApp.Login(username, password))
        {
            Console.WriteLine("✓ Login successful!");
            Console.WriteLine($"Username: {KeyAuthApp.Username}");
            Console.WriteLine($"Email: {KeyAuthApp.Email}");
            Console.WriteLine($"Subscription: {KeyAuthApp.Subscription}");
            Console.WriteLine($"Expiry: {KeyAuthApp.Expiry}");
            Console.WriteLine($"Token: {KeyAuthApp.Token}");
        }
        else
        {
            Console.WriteLine("✗ Login failed!");
        }
    }

    static async Task RegisterExample(API KeyAuthApp)
    {
        Console.Write("\nUsername: ");
        string username = Console.ReadLine();

        Console.Write("Password: ");
        string password = Console.ReadLine();

        Console.Write("Email (optional): ");
        string email = Console.ReadLine();

        Console.Write("License Key: ");
        string license = Console.ReadLine();

        Console.WriteLine("\nRegistering...");
        if (await KeyAuthApp.Register(username, password, license, email))
        {
            Console.WriteLine("✓ Registration successful!");
            Console.WriteLine($"Username: {KeyAuthApp.Username}");
            Console.WriteLine($"Email: {KeyAuthApp.Email}");
            Console.WriteLine($"Subscription: {KeyAuthApp.Subscription}");
            Console.WriteLine($"Expiry: {KeyAuthApp.Expiry}");
        }
        else
        {
            Console.WriteLine("✗ Registration failed!");
        }
    }

    static async Task LicenseExample(API KeyAuthApp)
    {
        Console.Write("\nLicense Key: ");
        string license = Console.ReadLine();

        Console.WriteLine("\nChecking license...");
        if (await KeyAuthApp.License(license))
        {
            Console.WriteLine("✓ License is valid!");
        }
        else
        {
            Console.WriteLine("✗ Invalid license!");
        }
    }
}
