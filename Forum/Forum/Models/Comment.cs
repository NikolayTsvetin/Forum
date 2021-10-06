using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Models
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; }

        public DateTime DateCreated { get; set; }

        [Required]
        [StringLength(300, ErrorMessage = "Post comment cannot be more than 300 symbols.")]
        public string Content { get; set; }

        public Guid PostId { get; set; }

        public string ApplicationUserId { get; set; }
    }
}
