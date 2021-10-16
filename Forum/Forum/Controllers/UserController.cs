using Forum.Models;
using Forum.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Controllers
{
    public class UserController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public UserController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            this._userManager = userManager;
            this._signInManager = signInManager;
        }

        [HttpGet]
        public bool IsUserLoggedIn()
        {
            return User.Identity.IsAuthenticated;
        }

        [HttpGet]
        public async Task<JsonResult> GetCurrentUser()
        {
            if (User.Identity.IsAuthenticated)
            {
                string userName = User.Identity.Name;
                ApplicationUser user = await _userManager.FindByNameAsync(userName);
                string userId = user.Id;

                return new JsonResult(new { userName = User.Identity.Name, userId = userId });
            }

            return new JsonResult(new { userName = string.Empty, userId = string.Empty });
        }

        [HttpPost]
        public async Task<JsonResult> RegisterUser([FromBody] RegistrationViewModel model)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser applicationUser = new ApplicationUser() { Email = model.Email, UserName = model.Email };
                var result = await _userManager.CreateAsync(applicationUser, model.Password);

                if (result.Succeeded)
                {
                    await _signInManager.SignInAsync(applicationUser, false);

                    return new JsonResult(new { success = true });
                }
                else
                {
                    foreach (var err in result.Errors)
                    {
                        ModelState.AddModelError("Error from user manager:", err.Description);
                    }

                    // ???
                    return new JsonResult(ModelState.Values);
                }
            }

            return new JsonResult(new { success = false });
        }

        [HttpPost]
        public async Task<JsonResult> Login([FromBody] LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, false, false);

                if (result.Succeeded)
                {
                    return new JsonResult(new { success = true });
                }

                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = false });
        }

        [HttpPost]
        public async Task<JsonResult> Logout()
        {
            await _signInManager.SignOutAsync();

            return new JsonResult(new { success = true });
        }
    }
}
