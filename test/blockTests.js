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

let t5 = `.[program version] v0.1.2

.[Page Start]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Block  >[program version] </title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
  >[Page Navigation]


.[Page End]
  </body>
</html>

.[Page Navigation]
<div class="container py-3">
  <header>
    <div class="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">
      <a href="https://github.com/shubhvjain/blocks" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="fs-4">Blocks >[program version] </span>
      </a>
      <nav class="d-inline-flex mt-2 mt-md-0 ms-md-auto">
        <a class="me-3 py-2 text-dark text-decoration-none" href="index.html">Home</a>
        <a class="me-3 py-2 text-dark text-decoration-none" href="docs.html">Docs</a>
      </nav>
    </div>
  </header>
</div>


.[Index page]
 >[Page start]
 >[Introduction]
 >[Page end]


.[Docs page]
 >[Page start]
 >[Introduction]
 >[Page end]

.[Introduction]
Hello. Testing if it works.
`

const fs = require("fs/promises");

const saveFile = async (filePath, fileContent) => {
  await fs.writeFile(filePath,fileContent)
}

const getFile = async (filePath) => {
  const data = await fs.readFile(filePath, { encoding: "utf8" });
  return data;
}

// getFile("source/block.txt").then(file=>{
//   b.generateOutputDoc(file,{type:"explorer"})
//   .then(doc=>{
//     console.log(doc)
//     saveFile("test/explore.html",doc)
//   })
// })
// .catch(err=>{console.log(err)})
// console.log(JSON.stringify(d.docObject,null,1))
// const g = require("./graph")
// g.generateGraphPreview([d.blockDepGraph,d.dfsTree,d.tsTree],{format:"html",outputPath:"sample4.html"})



