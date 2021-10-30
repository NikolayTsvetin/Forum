﻿using Forum.Models;
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
        public async Task<IEnumerable<LikedPost>> GetPostLikes(string postId)
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

        [HttpPost]
        public async Task<JsonResult> LikeComment([FromBody] LikedComment model)
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

            return new JsonResult(new { success = false, error = "Wrong view model sent. Expected comment id and user id." });
        }

        [HttpGet]
        public async Task<JsonResult> GetAllLikesForCommentsOnPost(string postId)
        {
            try
            {
                Guid.TryParse(postId, out Guid key);

                // get ids for all comments on post
                Post post = await context.Posts.FindAsync(key);
                List<Comment> allComments = await context.Comments.ToListAsync();
                IEnumerable<Comment> commentsForPost = allComments.Where(x => x.PostId == post.Id);
                List<Guid> commentsIds = commentsForPost.Select(x => x.Id).ToList();

                List<LikedComment> allLikesForCommentsOnPost = new List<LikedComment>();

                // get all likes for these comments
                List<LikedComment> allLikes = await context.LikedComments.ToListAsync();
                foreach (var likedComment in allLikes)
                {
                    if (commentsIds.IndexOf(likedComment.CommentId) >= 0)
                    {
                        allLikesForCommentsOnPost.Add(likedComment);
                    }
                }

                return new JsonResult(new { likesForComments = allLikesForCommentsOnPost }); ;
            }
            catch (Exception ex)
            {
                return new JsonResult(new { error = $"There is error: ${ex.Message}" });
            }
        }
    }
}
