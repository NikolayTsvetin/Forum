using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Models
{
    public class Post
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "Post title cannot be more than 50 symbols.")]
        public string Title { get; set; }

        [StringLength(500, ErrorMessage = "Post content cannot be more than 500 symbols.")]
        public string Content { get; set; }

        public DateTime DateCreated { get; set; }

        public IEnumerable<Comment> Comments { get; set; }

        public string ApplicationUserId { get; set; }
    }
}
