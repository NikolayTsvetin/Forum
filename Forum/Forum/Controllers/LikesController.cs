using Forum.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Controllers
{
    public class LikesController : Controller
    {
        private readonly ForumContext context;
        private readonly UserManager<ApplicationUser> _userManager;

        public LikesController(ForumContext context, UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this._userManager = userManager;
        }

        [HttpGet]
        public async Task<IEnumerable<LikedPost>> GetLikes(string postId)
        {
            List<LikedPost> allLikes = await context.LikedPosts.ToListAsync();

            return allLikes.Where(x => String.Equals(x.PostId.ToString(), postId, StringComparison.InvariantCultureIgnoreCase));
        }

        [HttpGet]
        public async Task<bool> IsPostLikedByUser(string postId, string userId)
        {
            List<LikedPost> allLikes = await context.LikedPosts.ToListAsync();
            List<LikedPost> likesForPost = allLikes.Where(x => String.Equals(x.PostId.ToString(), postId, StringComparison.InvariantCultureIgnoreCase)).ToList();

            if (likesForPost.Count > 0)
            {
                List<LikedPost> likedByUser = likesForPost.Where(x => String.Equals(x.UserId.ToString(), userId, StringComparison.InvariantCultureIgnoreCase)).ToList();

                return likedByUser.Count > 0 ? true : false;
            }

            return false;
        }

        [HttpPost]
        public async Task<JsonResult> LikePost([FromBody] LikedPost model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    model.Id = Guid.NewGuid();

                    await context.AddAsync(model);
                    await context.SaveChangesAsync();

                    return new JsonResult(new { success = true });
                }
                catch (Exception ex)
                {
                    return new JsonResult(new { success = false, error = ex.Message });
                }
            }

            return new JsonResult(new { success = false, error = "Wrong view model sent. Expected post id and user id." });
        }
    }
}
