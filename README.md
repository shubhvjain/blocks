# blocks
markdown inspired text markup. The purpose is to separate the text and display style so that a single text source can be displayed in multiple formats. 

For example, the same text can be used to generate a pdf file (in LaTEX), web page (in HTML), a slide deck (html/pdf), plain text, mind map and many more.  

Another aim is to support [literate programming](https://en.wikipedia.org/wiki/Literate_programming). Keeping the code alongside it's explanation for humans to understand the code better and generating a separate code file for machines.

A page (the input the the program) consists  of blocks, the basic processing unit.
Each block is separated by a new line. This means a block can be a single sentence,a paragraph, a list, a heading, code etc. 
Metadata related to a block is defined within the annotation delimiter (which can be configured). 
