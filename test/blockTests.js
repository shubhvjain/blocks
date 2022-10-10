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


const b = require("./block")

let t1 = `.[main]
>[part1]
>[part2]
>[part3]

.[part1]
>[part1-1]
>[part1-2]
>[part1-3]

.[part1-1]

.[part1-2]

.[part1-3]

.[part2]
>[part2-1]
>[part2-2]

.[part2-1]

.[part2-2]


.[part3]
>[part3-1]
>[part3-2]
>[part3-3]

.[part3-1]

.[part3-2]

.[part3-3]

.[unrelated part 1]

.[unrelated part 2]
`




// b.generateDocObject(t1)


let t2= `.[main]
>[1]
>[2]
>[3]


.[1] 1

.[2] 2

.[3-1]

.[3-2]

.[3]
>[3-1]
>[3-2]
`

let t3 = `
.[main1]
>[p1]
>[p2]

.[p1] part 1

.[p2] part 2
>[p2-1]
>[p2-2]

.[p2-1] 

.[p2-2]

.[main2]
>[p1]
>[p3]


.[p3] 

`

let i1 = `.[1]  one
>[2]

.[2]
>[2-1]
>[2-2]

.[2-1]
>[1]

.[2-2]
>[1]
`

let i2 = `.[main]
>[1]


.[1] one
>[6]

.[2] two
>[2-1]
>[1]

.[2-1]
>[2-2]

.[2-2]
>[2]

.[3] three
>[2]

.[4] four
>[3]

.[5] five
>[4]

.[6] six
>[5]

`

let t4 = `.[main] Main 
>[1]

.[1] one
>[17]

.[2] Two
  >[2-1]
  >[2-2]

.[2-1] part two section one

.[2-2] part two section two

.[+1]
more in part 1
  >[2]

.[+1] even more in part 1
  >[3]  

.[3] Part 3
>[3-1] 
>[3-2] 

.[3-1] Part 3 section 1

.[3-2] Part 3 section 2

.[17] this is 17

`


b.generateDocObject(t4)

