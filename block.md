# the block program 
version 1.0.0

A `document` is a collection of  linear blocks.
Linear means that the blocks are processed in the same order as they were written in the document. 
Blocks are seperated by a new line i.e. a new block ends with a blank line.
A Block can have metadata like ID.
Content can be appended to a block at a later stage in the document.
These additional things in the blocks are specified within the block body using **annotation** delimiters. 
The 2 main annotation delimiters :
- **decleration** : `.[ ]`
- **application** : `>[ ]` 

## The decleration annotation `.[]`

This can be used to declare metadata within a block
In this version of the program, it's usage is limited to 2 tasks: declare block id and append to a block

To assign id to a block :

Example : 

```
.[Title of block] This is the block content 
```

(in the above example, the block has the id "Title of the block" and it;s content is "This is a block content ")

Another example : 

```
.[block 1] this is the first block in the doc

.[block 2] this is the second block

```

To append content to a block, just add a "+" (plus) sign in the begining of the block at the append site 

Example :

```
.[b1] this the block number 1, which has some content here.

.[b2] this is the 2nd block. 

now i feel like appending more to the first block. I can go on the top of the doc and do it but that would not indicate how my doc evolved with my explrations. 

so here you go ....

.[+b1] this is some more content that will be appended to block with id "b1"
```

## The application annotation `>[]`
The application annotation allows the writer to include the content of one block into another. This is done by including the id of the block to be included at the location where it must be included. The name of the block to is specified withing `>[]` 

this interesting thing is that a block need not be declared before it is used in another block. This means the writer can use the application annotation to include block that are not yet created and then declare them later. 

Example :
```
.[main content]
  >[part1]
  >[part2]

notice that we have not yet defined part1 or part2. Let's do that now 

.[part1] this is part one of my content

.[part2] this is a more complex block. Not only this contains text of it's own, it also has appliction annotations for other block. 
>[part2.1]
>[part2.2]

.[part2.1] Part 2.1

.[part2.2] Part 2.2

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
1. Convert the document to blocks
2. Initialize the DocumentObject
3. First pass through the blocks
4. Dependency analysis
5. Second pass through the blocks
6. Code file generation  






