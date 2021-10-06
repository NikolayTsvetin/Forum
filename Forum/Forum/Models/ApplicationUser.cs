using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Models
{
    public class ApplicationUser : IdentityUser
    {
        public List<Post> Posts { get; set; }

        public List<Comment> Comments { get; set; }
    }
}
