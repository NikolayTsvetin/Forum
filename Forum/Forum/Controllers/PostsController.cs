using Forum.Models;
using Forum.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Controllers
{
    public class PostsController : Controller
    {
        private readonly ForumContext context;
        private readonly UserManager<ApplicationUser> _userManager;

        public PostsController(ForumContext context, UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this._userManager = userManager;
        }

        [HttpGet]
        public async Task<IEnumerable<Post>> GetPosts()
        {
            List<Post> posts = await context.Posts.ToListAsync();

            return posts;
        }

        [HttpPost]
        public async Task<JsonResult> CreatePost([FromBody] Post post)
        {
            if (ModelState.IsValid)
            {
                string userName = User.Identity.Name;
                ApplicationUser user = await _userManager.FindByNameAsync(userName);
                string userId = user.Id;

                post.DateCreated = DateTime.Now;
                post.Id = Guid.NewGuid();
                post.ApplicationUserId = userId;

                await context.AddAsync(post);
                await context.SaveChangesAsync();

                return new JsonResult(new { success = true });
            }

            return new JsonResult(new { success = false });
        }

        [HttpPost]
        public async Task<JsonResult> UpdatePost([FromBody] Post post)
        {
            if (ModelState.IsValid)
            {
                Post foundPost = await context.Posts.FindAsync(post.Id);
                foundPost.Title = post.Title;
                foundPost.Content = post.Content;

                context.Posts.Update(foundPost);
                await context.SaveChangesAsync();

                return new JsonResult(new { success = true });
            }

            return new JsonResult(new { success = false });
        }

        [HttpDelete]
        public async Task<JsonResult> DeletePost([FromBody] string id)
        {
            Guid.TryParse(id, out Guid key);

            try
            {
                Post post = await context.Posts.FindAsync(key);
                context.Posts.Remove(post);

                await context.SaveChangesAsync();

                return new JsonResult(new { success = true });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { success = false, error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<JsonResult> GetPostInformation([FromBody] string id)
        {
            Guid.TryParse(id, out Guid key);

            try
            {
                Post post = await context.Posts.FindAsync(key);

                if (post == null)
                {
                    return Json(new { error = $"There wasn't post with id: ${id}" });
                }

                List<Comment> comments = await context.Comments.ToListAsync();
                IEnumerable<Comment> commentsForPost = comments.Where(x => x.PostId == post.Id);

                post.Comments = commentsForPost;

                return new JsonResult(new { post = post });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { error = $"There is error: ${ex.Message}" });
            }
        }

        [HttpGet]
        public async Task<IEnumerable<Post>> GetPostsByUser(string id)
        {
            List<Post> posts = await context.Posts.ToListAsync();
            List<Post> postsByUser = posts.Where(x => String.Equals(x.ApplicationUserId.ToString(), id, StringComparison.InvariantCultureIgnoreCase)).ToList();

            return postsByUser;
        }
    }
}
