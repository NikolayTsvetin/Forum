﻿using Forum.Models;
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
    }
}
