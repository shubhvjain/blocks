// use this while working on the block code. 
// run this from the root dir of the project
const fs = require("fs/promises");

const saveFile = async (filePath, fileContent) => {await fs.writeFile(filePath,fileContent)}
const getFile = async (filePath) => {const data = await fs.readFile(filePath, { encoding: "utf8" });return data;}

const blockLatest = require("../release/block")
const blockTest = require("../test/block")

const genDoc = require("../release/genDoc")
// this will generate the latest test version of block.js (inside the test folder) using the latest released version of the block program
const generateTestBlockCodeUsingLatestRelease = async ()=>{
  try {
    let fileContent = await getFile("source/block-alg.txt")
    const processedDoc  = await  genDoc.generateOutput(fileContent,{DEV:false,type:"file-with-entry" ,main:"main"})
    await saveFile("test/block.js",processedDoc)
    console.log("test/block.js updated!") 
  } catch (error) { }
}

// this generates the explorer document for the lastest source file (i.e. the block.txt inside the source folder)
// this will use the block program in the test folder 
const generateExplorerDocForSourceUsingTest = async ()=>{
  try {
    let fileContent = await getFile("source/block-alg.txt")
    let generatedDoc = await genDoc.generateOutput(fileContent,{DEV:true,type:"explorer"})
    await saveFile("test/explorer-block.html",generatedDoc) 
  } catch (error) {}
}

const generateExplorerDocForDocUsingTest = async (docPath)=>{
  let fileContent = await getFile(docPath)
  const parts = docPath.split("/")
  const nameparts = parts[parts.length-1].split(".")
  const name = nameparts[0]
  let generatedDoc = await blockTest.generateOutputDoc(fileContent,{type:"explorer"})
  await saveFile(`test/explorer-${name}.html`,generatedDoc)
  console.log(`generated : test/explorer-${name}.html`)
}

const generateCodeFileFromSomeSource = async (docPath,fileName,fileType,blockName)=>{
  try {
    let fileContent = await getFile(docPath)
    const processedDoc  = await genDoc.generateOutput(fileContent,{DEV:true,type:fileType, main:blockName})
    await saveFile(`test/${fileName}`,processedDoc)
    console.log(`test/${fileName} created!`) 
  } catch (error) {}
}

const main = async ()=>{
  const cmdName = process.argv[2]
  cmds = {
    0 : async ()=>{
      const help =  ` Hello! Here is the list of commands : 
0: help
1: generate test/block.js using release/block.js
2: generate explorer doc for source/block.txt using release/block.js
3: generate explorer doc for source/block.txt using test/block.js
4: generate test file also give 'path-to-source-file' 'filename' 'block-id' (new file will be stored in test folder only)
5: generate doc using test/block.js : arg: 'path-to-source-file' 'filename' 'docType (file-with-entry,explorer)' 'block-id'
`
      console.log(help)
    },
    1: async () =>{
      await generateTestBlockCodeUsingLatestRelease()
    },
    2: async()=>{ console.log("....after next version is released")},
    3: async () =>{
      await generateExplorerDocForSourceUsingTest()
    },
    4: async ()=>{
      await generateCodeFileFromSomeSource(process.argv[3],process.argv[4],"file-with-entry",process.argv[5])
    },
    5: async ()=>{
      await generateCodeFileFromSomeSource(process.argv[3],process.argv[4],process.argv[5],process.argv[6])
    },
  }
  if(!cmds[cmdName]){throw new Error("invalid command. use '0' for list of available commands")}
  await cmds[cmdName]()
}

main().then(d=>{console.log("Done!")}).catch(e=>{console.log(e)})