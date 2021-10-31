using Forum.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Forum.ViewModels
{
    public class TopPostViewModel
    {
        public Post Post { get; set; }

        public int LikesCount { get; set; }

        public string Author { get; set; }
    }
}
