using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.Models
{
    public class LikedPost
    {
        [Key]
        public Guid Id { get; set; }

        public Guid PostId { get; set; }

        public Guid UserId { get; set; }
    }
}
