# Blocks

[Documentation](https://shubhvjain.github.io/blocks/)

Text markup and document processing system. 

The purpose is to separate the text and display style so that a single text source can be displayed in multiple formats. For example, the same text can be used to generate a pdf file (in LaTEX), web page (in HTML), a slide deck (html/pdf), plain text, mind map and many more.  

Another aim is to support [literate programming](https://en.wikipedia.org/wiki/Literate_programming). Keeping the code alongside it's explanation for humans to understand the code better and generating a separate code file for machines.

A document (the input the the program) consists  of blocks, the basic processing unit.
Each block is separated by a new line. This means a block can be a single sentence,a paragraph, a list, a heading, code etc.  Metadata related to a block is defined within the annotation delimiter. 


## folder structure 
there  is a single level folder hierarchy i.e no sub folders. all the code including related code remains in the same folder. There are, however, 4  folders in the root folder of the project.
- `source` : the source code and other stuff related to the version currently under development stays here . this folder is used during developement.
- `test` : this contains code to test the program. this may have an internal working copy of the program
- `release` : this is where the main code of the program lies. code of the lastest relase version is in this folder. the whole folder is released as a whole.
- `scripts`: utility scripts to do many things like releasing a new version of the program, updating program dependencies etc...

## to release a new version 

run this command from the base directory of the project : `node ./script/release.js versionType`

(valid version types : `major` , `minor` , `patch`)

## Useful scripts 

Run from the root of the project

- `node test/develop.js cmd` : to run testing commands while working on the block program. like generating a new copy of block.js for testing using the lastest released version of the program. use '0' as 'cmd' for the list of all commands
- `cp plugins/vscode-syntax-highlight/syntaxes/block.tmLanguage.json ~/.vscode/extensions/vscode-syntax-hilighter/syntaxes ` : to update the syntax file for vscode highlight extension on mac. Assuming the folder is already copied once
- `node scripts/release.js versionType` : to release a new version of the program. specify version type (`major`, `minor` or `patch`)
