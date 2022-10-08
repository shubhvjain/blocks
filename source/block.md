# The block program 
version `0.1.0`

This version of the program is simply to bootstrap the basic version of the program. This is written so that a more advanced version of the program can be written as a document that can be processed by the block program itself. 

A `document` is a collection of  linear blocks.
Linear means that the blocks are processed in the same order as they were written in the document. 
Blocks are separated by a new line i.e. a new block ends with a blank line.
A Block can have metadata like ID.
Content can be appended to a block at a later stage in the document.
These additional things in the blocks are specified within the block body using **annotation** delimiters. 
The 2 main annotation delimiters :
- decleration : `.[ ]`
- application : `>[ ]` 

## The declaration annotation `.[]`

This can be used to declare metadata within a block. This this optional but, if defined, it must be the first thing in the block. 
In this version of the program, its usage is limited to 2 tasks: declare block id and append to a block

### To assign an ID to a block :

Example : 

```
.[Title of block] This is the block content 
```

(in the above example, the block has the id "Title of the block" and its content is "This is a block content ")

Another example : 

```
.[block 1] this is the first block in the doc

.[block 2] this is the second block

```
### Some rules for the block IDs 
- valid characters : alphabets, digits, space, dash 
- note that the **only** special symbol allowed in the block name is a dash (`-`).
- IDs are case-insensitive as well as space sensitive. This allows for some flexibility during writing. for instance. The  ids `This is a block name` , `this is a Block name` and `this-is-a-block-name` are all equivalent
 

### Append content to a block

Add a "+" (plus) sign in the beginning of the block Id at the append site 

Example :

```
.[b1] this the block number 1, which has some content here.

.[b2] this is the 2nd block. 

now i feel like appending more to the first block. I can go on the top of the doc and do it but that would not indicate how my doc evolved with my explorations. 

so here you go...

.[+b1] this is some more content that will be appended to block with id "b1"
```

## The application annotation    `>[]`
The application annotation allows the writer to include the content of one block in another. This is done by including the id of the block to be included at the location where it must be included. The name of the block is specified within `>[]` 

this interesting thing is that a block need not be declared before it is used in another block. This means the writer can use the application annotation to include a block that is not yet created and then declare it later. 

Example :
```
.[main content]
  >[part1]
  >[part2]

Notice that we have not yet defined part1 or part2. Let's do that now. Also, note that is a new block and does not have an ID.  

.[part1] this is part one of my content

.[part2] this is a more complex block. Not only this contains the text of its own, it also has application annotations to include other blocks. 
>[part 2-1]
>[part 2-2]

.[part 2-1] Part 2.1

.[part 2-2] Part 2.2

```

# the block program 

## the goal :

 { inputPath, outputPath, mainId } ---> [block program] ---> code file

In this version of the program, the goal is simple 
- read the file from the `inputPath`
- start from the `mainId` and generate a code file
- finish by saving the code file at `outputPath`

The goal may seem simple but it involves interation between a lot of complex components. 

## The overview of the algorithm

 1. Generate document object 
 2. Generate dependency graph 
 3. Check for cycles 
 4. Generate the order of processing 
 5. generate code files
 6. save code files  

### Part 1. Generate the document object 

1. split the doc by the new line character

```js
const docToBlocks = (doc,splitter)=>{
  return doc.split(splitter)
}
```

2. intialize the documentObject 
   1. `blocks`: (array) a list of blocks 
   2. `data` : (object)

```js
const getBlankDocObj = ()=>{
  let newObj = {
    blocks:[],
    data:{},
  }
  return {... newObj}
}
```

3. initialize the blockDependency digraph  

```js
const graph = require('.')

```

4. loop through the block.
   1. [decleration processing phase] At the end of this phase, all decleration annotations will be processed and all the blocks will have the final text value at the end of this phase. This phase also prepares for the next phase, the application processing phase. It adds a vertex corresponding to each block in the blockDep graph. It also checks if application annoations are used in the text. If yes, then add a new edge in the graph from the block id inside the application annotation to the current block id. This means to the annotated block is a dependency of the current block. 
   2. add a new vertex in the blockDep graph   
   3. extract all annotations in the block
   4. process decleration annotations 
      1. process new declerations
      2. process appening declerations.
   5. Pre process application annotations
      1. update blockDep graph if the current blocks has some application declerations.
   6. finally, save blocks details in the doc Object 

```js
const generateDocObject = (doc,options)=>{

} 

```