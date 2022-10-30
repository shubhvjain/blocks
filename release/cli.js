/**
 * to use the block program in the terminal
 */
 const fs = require("fs/promises");
const block = require("./block")


const getFile = async (filePath) => {
  const data = await fs.readFile(filePath, { encoding: "utf8" });
  return data;
}

const saveFile = async (filePath, fileContent) => {
  await fs.writeFile(filePath,fileContent)
}

const main = async ()=>{
  const progs = {
   'build':async ()=>{
      const inputPath = process.argv[3]
      if(!inputPath){throw new Error("Provide input file path")}

      const outputPath = process.argv[4]
      if(!outputPath){throw new Error("Provide output path file")}

      const entryBlock  = process.argv[5]
      if(!entryBlock){throw new Error("Provide entry block name")}

      const doc = await getFile(inputPath)
      const processedDoc  = await block.generateOutputDoc(doc,{type:"file-with-entry", main:entryBlock})
      await saveFile(outputPath,processedDoc)
      console.log("Done!")
   }
  }
  const cmdName = process.argv[2]
  await  progs[cmdName]()
 }
 
 
 main()
 .then(data=>{
 if(data){console.log(data)}
 }).catch(error=>{
 console.error(error)
 })
 