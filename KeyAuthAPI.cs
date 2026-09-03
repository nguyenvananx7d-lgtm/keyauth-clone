using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace KeyAuth
{
    public class API
    {
        private string appName;
        private string ownerID;
        private string apiUrl;
        private HttpClient client;

        public string Username { get; private set; }
        public string Email { get; private set; }
        public string Expiry { get; private set; }
        public string Subscription { get; private set; }
        public string Token { get; private set; }

        public API(string appName, string ownerID, string apiUrl = "https://keyauth-website.onrender.com")
        {
            this.appName = appName;
            this.ownerID = ownerID;
            this.apiUrl = apiUrl;
            this.client = new HttpClient();
        }

        public async Task<bool> Init()
        {
            try
            {
                var data = new
                {
                    appName = this.appName,
                    ownerID = this.ownerID
                };

                var json = JsonConvert.SerializeObject(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{apiUrl}/api/client/init", content);
                var responseString = await response.Content.ReadAsStringAsync();
                var result = JObject.Parse(responseString);

                if (result["success"].Value<bool>())
                {
                    return true;
                }
                else
                {
                    Console.WriteLine($"Init failed: {result["message"]}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Init error: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> Login(string username, string password)
        {
            try
            {
                var data = new
                {
                    username = username,
                    password = password,
                    appName = this.appName,
                    ownerID = this.ownerID
                };

                var json = JsonConvert.SerializeObject(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{apiUrl}/api/client/login", content);
                var responseString = await response.Content.ReadAsStringAsync();
                var result = JObject.Parse(responseString);

                if (result["success"].Value<bool>())
                {
                    var user = result["user"];
                    this.Username = user["username"].Value<string>();
                    this.Email = user["email"]?.Value<string>();
                    this.Expiry = user["expiry"]?.Value<string>();
                    this.Subscription = user["subscription"]?.Value<string>();
                    this.Token = user["token"].Value<string>();
                    return true;
                }
                else
                {
                    Console.WriteLine($"Login failed: {result["message"]}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> Register(string username, string password, string license, string email = "")
        {
            try
            {
                var data = new
                {
                    username = username,
                    password = password,
                    email = email,
                    license = license,
                    appName = this.appName,
                    ownerID = this.ownerID
                };

                var json = JsonConvert.SerializeObject(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{apiUrl}/api/client/register", content);
                var responseString = await response.Content.ReadAsStringAsync();
                var result = JObject.Parse(responseString);

                if (result["success"].Value<bool>())
                {
                    var user = result["user"];
                    this.Username = user["username"].Value<string>();
                    this.Email = user["email"]?.Value<string>();
                    this.Expiry = user["expiry"]?.Value<string>();
                    this.Subscription = user["subscription"]?.Value<string>();
                    this.Token = user["token"].Value<string>();
                    return true;
                }
                else
                {
                    Console.WriteLine($"Register failed: {result["message"]}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Register error: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> License(string licenseKey)
        {
            try
            {
                var data = new
                {
                    license = licenseKey,
                    appName = this.appName,
                    ownerID = this.ownerID
                };

                var json = JsonConvert.SerializeObject(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{apiUrl}/api/client/license", content);
                var responseString = await response.Content.ReadAsStringAsync();
                var result = JObject.Parse(responseString);

                if (result["success"].Value<bool>())
                {
                    return true;
                }
                else
                {
                    Console.WriteLine($"License check failed: {result["message"]}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"License error: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> Upgrade(string username, string license)
        {
            try
            {
                var data = new
                {
                    username = username,
                    license = license,
                    appName = this.appName,
                    ownerID = this.ownerID
                };

                var json = JsonConvert.SerializeObject(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{apiUrl}/api/client/upgrade", content);
                var responseString = await response.Content.ReadAsStringAsync();
                var result = JObject.Parse(responseString);

                if (result["success"].Value<bool>())
                {
                    var user = result["user"];
                    this.Subscription = user["subscription"]?.Value<string>();
                    this.Expiry = user["expiry"]?.Value<string>();
                    return true;
                }
                else
                {
                    Console.WriteLine($"Upgrade failed: {result["message"]}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Upgrade error: {ex.Message}");
                return false;
            }
        }
    }
}
