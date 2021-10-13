using Forum.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Controllers
{
    public class CommentsController : Controller
    {
        private readonly ForumContext context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CommentsController(ForumContext context, UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this._userManager = userManager;
        }

        [HttpPost]
        public async Task<object> AddComment([FromBody] Comment comment)
        {
            if (ModelState.IsValid)
            {
                string userName = User.Identity.Name;
                ApplicationUser user = await _userManager.FindByNameAsync(userName);
                string userId = user.Id;

                comment.DateCreated = DateTime.Now;
                comment.Id = Guid.NewGuid();
                comment.ApplicationUserId = userId;
                comment.AuthorName = userName;
                
                await context.AddAsync(comment);
                await context.SaveChangesAsync();

                return Json(new { success = true });
            }

            return Json(new { success = false });
        }
    }
}
