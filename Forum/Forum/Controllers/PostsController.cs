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
    }
}
