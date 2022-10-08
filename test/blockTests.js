const tests = [
{
  req: `.[Title of block] This is the block content 

.[block 1] this is the first block in the doc
  
.[block 2] this is the second block
  
.[b1] this the block number 1, which has some content here.
  
.[b2] this is the 2nd block. 
  
now i feel like appending more to the first block. I can go on the top of the doc and do it but that would not indicate how my doc evolved with my explrations. 
  
so here you go ....
  
.[+b1] this is some more content that will be appended to block with id "b1"
  
.[main content]
  >[part1]
  >[part2]
  
notice that we have not yet defined part1 or part2. Let's do that now 
  
.[part1] this is part one of my content
  
.[part2] this is a more complex block. Not only this contains text of it's own, it also has appliction annotations for other block. 
  >[part2-1]
  >[part2-2]
  
.[part2-1] Part 2.1
  
.[part2-2] Part 2.2`,
  response: {
    docObj : {
      blocks:[],
      data:{
        "Title-of-block":{
          rawId: "Title of block",
          alias: "",
          rawText:".[Title of block] This is the block content",
          textType:"text",
          text:"This is the block content",
          annotations:{
            type1:[".[Title of block]"],
            type2:[]
          }
        },

      }
    }
  }
},




]