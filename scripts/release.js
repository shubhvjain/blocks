
/*
IMPORTANT : run this script from the base folder of the project. 

this script is used to release a new version of the program. 
the first version of the program i.e v0.1.0 is released manually and later versions will be released using this script.
process:
- all things happen in the `release` folder
1. get (and store the) latest version of code dependencies 
2. get the source file for the block program i.e `/source/block-alg.txt`. use the current release version of the block program to generate the new block program 
3. generate new version number 
4. generate the copyright text
5. combine  copyright text, version number and code and store it as `block.js` in the release folder
6. update the latestReleasedVersion file in script folder.
Done!
*/

const fs = require("fs/promises");
const gDoc = require("../release/genDoc")

const copyFileInRelease = async (opt)=>{
  await fs.copyFile(opt.path,`./release/${opt.fileName}`)
}

const updateDeps = async ()=>{
  let deps = [ { fileName: "graph.js", path: "./source/graph.js"} ]
  for (let index = 0; index < deps.length; index++) {
    const element = deps[index];
    await copyFileInRelease(element)
  }
}

const getFile = async (filePath) => {
  const data = await fs.readFile(filePath, { encoding: "utf8" });
  return data;
}

const saveFile = async (filePath, fileContent) => {
  await fs.writeFile(filePath,fileContent)
}

const getNewVersion = async (verType)=>{
  let ver =  JSON.parse(await getFile('./scripts/lastReleasedVersion.json'))
  const parts = ver['version'].split(".")
  ver['major'] = parseInt(parts[0])
  ver['minor'] = parseInt(parts[1])
  ver['patch'] = parseInt(parts[2])
  const verRel = {
    major:()=>{
      ver[verType] += 1
      ver['minor'] =  0
      ver['patch'] =  0
    },
    minor:()=>{
      ver[verType] += 1
      ver['patch'] =  0
    },
    patch:()=>{
      ver[verType] += 1
    }
  }
  verRel[verType]()
  return {version: `${ver['major']}.${ver['minor']}.${ver['patch']}` }
}

const newHeader = async (options = {})=>{
  const newVersion = await getNewVersion(options.releaseType)
  const data = {
    authorName: "Shubh",
    about: `the Block program. Version ${newVersion.version} . 
Full source code is available at https://github.com/shubhvjain/blocks`
  }
  const header =  `/*** 
${data.about}
Copyright (C) ${new Date().getFullYear()}  ${data.authorName}
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/> 
***/
`
  return {header, newVersion}
}

const main = async () => {
  try {
    const validReleaseType = ['major','minor','patch']
    const args = process.argv
    const releaseType = args[2]
    if(validReleaseType.indexOf(releaseType) == -1 ){
      throw new Error(`Invalid release type. Valid values : ", ${validReleaseType.join(",")}`)
    }
    await updateDeps()
    const blockFile = await getFile("./source/block-alg.txt")
    const codeFileContent = await  gDoc.generateOutput(blockFile,{main:"main",type:"file-with-entry"})
    const newCopyRightAndVersion = await newHeader({releaseType })
    const fullText = `${newCopyRightAndVersion.header}${codeFileContent}`
    await saveFile('./release/block.js',fullText)
    await saveFile('./scripts/lastReleasedVersion.json',JSON.stringify(newCopyRightAndVersion.newVersion))
    console.log("Released : ",newCopyRightAndVersion.newVersion)
  } catch (error) {
    console.log(error)
  }
}
main().then(data=>{console.log("Done.")}).catch(err=>{console.log(err)})