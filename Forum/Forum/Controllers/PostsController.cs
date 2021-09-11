using Forum.Models;
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

        public PostsController(ForumContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<Post>> GetPosts()
        {
            List<Post> posts = await context.Posts.ToListAsync();

            return posts;
        }

        [HttpPost]
        public async Task<object> CreatePost([FromBody] Post post)
        {
            if (ModelState.IsValid)
            {
                post.DateCreated = DateTime.Now;
                post.Id = Guid.NewGuid();

                await context.AddAsync(post);
                await context.SaveChangesAsync();

                return Json(new { success = true });
            }

            return Json(new { success = false });
        }

        [HttpPost]
        public async Task<object> UpdatePost([FromBody] Post post)
        {
            if (ModelState.IsValid)
            {
                Post foundPost = await context.Posts.FindAsync(post.Id);
                foundPost.Title = post.Title;
                foundPost.Content = post.Content;

                context.Posts.Update(foundPost);
                await context.SaveChangesAsync();

                return Json(new { success = true });
            }

            return Json(new { success = false });
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

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
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

                return Json(new { post = post });
            }
            catch (Exception ex)
            {
                return Json(new { error = $"There is error: ${ex.Message}" });
            }
        }
    }
}
