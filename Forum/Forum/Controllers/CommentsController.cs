using Forum.Models;
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

        public CommentsController(ForumContext context)
        {
            this.context = context;
        }

        [HttpPost]
        public async Task<object> AddComment([FromBody] Comment comment)
        {
            if (ModelState.IsValid)
            {
                comment.DateCreated = DateTime.Now;
                comment.Id = Guid.NewGuid();

                await context.AddAsync(comment);
                await context.SaveChangesAsync();

                return Json(new { success = true });
            }

            return Json(new { success = false });
        }
    }
}
