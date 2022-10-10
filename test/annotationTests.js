const b = require("./block")

let names = [
  ["+this is to be appended","this-is-to-be-appended"],
  ["this is  a block id    ","this-is-a-block-id"],
  ["    this is  a block id    ","this-is-a-block-id"],
  ["   This IS in Upper    ","this-is-in-upper"],
]
 
names.map(name=>{
 console.log(name)
 console.log( b.hashBlockId(name[0]) )
})