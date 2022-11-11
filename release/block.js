/*** 
the Block program. Version 0.8.0 . 
Full source code is available at https://github.com/shubhvjain/blocks
Copyright (C) 2022  Shubh
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

  
  
const graph = require('./graph')
  
  
const annotations = {
  
declaration: {
  extract:(text)=>{
      const tx = text.trim()
      const theRegex = /^\.\[([\+]?)([\w\s\-]+?)\]/gm
      const parts = tx.match(theRegex)
      let rawSource = `.[${randomInteger(10000,99999)}]`
      if(parts){rawSource = parts[0]}
      let processedSource = rawSource.replaceAll(".[","")
      processedSource = processedSource.replaceAll("]","")
      const blockName = hashBlockId(processedSource)
      return { rawSource, isAppend: blockName.isAppend, id: blockName.id }
    },
    generateText: (text)=>{
      const theRegex = /^\.\[([\+]?)([\w\s\-]+?)\]/gm
      return text.replaceAll(theRegex,"")
    }
},
  
invocation: {
    extract: (text) =>{
      const txt = text.trim()
      const theRegex = /\>\[([\w\s\-]+?)([\.]*)([\w\s\-]*)([\.]*)([\w\s\-]*)\]/gm
      const parts = txt.match(theRegex)
      let asmts = []
      if(parts){
        parts.map(part=>{
          let t = part.replaceAll(">[","")
          t = t.replaceAll("]","")
          let processBlockName = hashBlockId(t)
          asmts.push({ rawSource: part, blockId: processBlockName['id'], subBlockId : processBlockName['subId'], subSubBlockId: processBlockName['subSubId'] })
        })
      }
      return asmts
    }
},
  
action: {
  extract: (text) => {
    const txt = text.trim()
      const theRegex = /\/\[([\s\w\:\,\=\%\.\(\)\_\-\/\>\<]+?)\]/gm
      const parts = txt.match(theRegex)
      let actions = []
      if(parts){
        parts.map(part=>{
          let t = part.replaceAll("/[","")
          t = t.replaceAll("]","")
          let actionInfo = parseActionArguments(t)
          actions.push({ rawSource: part, ...actionInfo  })
        })
      }
      return actions
  }
}
}
  
  
const parseActionArguments = (argumentText)=>{
  let result = { action:"", arguments:{ text:"",d:"0"}}
  let parts = argumentText.split(":")
  let obj = { key: parts[0].trim(), value : '' }
  parts.shift()
  obj.value = parts.join(":")
  result.action =  obj.key 
    let argParts = obj.value.split(",")
    if(argParts.length>0){
      result.arguments['text'] = argParts[0].trim()
      argParts.shift()
      argParts.map(argu=>{
        let ar = argu.split("=")
        result.arguments[ar[0].trim()] = ar[1].trim()
      })
    }
  return result
}
  
const getGraphStringParts = (text) => {
          let dets = {node: "",label: "",direction: ""}
          if (text.indexOf(')->') > -1) {
            let parts = text.split(")->")
            dets.label = parts[0].replace('-(', '')
            dets.node = parts[1]
            dets.direction = "from-current"
          } else if (text.indexOf('<-(') > -1) {
            let parts = text.split(")-")
            dets.label = parts[0].replace('<-(', '')
            dets.node = parts[1]
            dets.direction = "to-current"
          } else if (text.indexOf(')') > -1) {
            let parts = text.split(")")
            dets.label = parts[0].replace('(', '')
            dets.node = parts[1]
            dets.direction = "custom"
          }
          return dets
      }
  
const getNodeLabelForKG = (idObj) => {return idObj.id} 
  const actions = {
    
'data': {
    'about':'To declare data type for a block',
    'process':(actionData,blockData,options={})=>{
      let selectedDataType = actionData.arguments.text
      let processedData = dataType[selectedDataType]['process'](blockData.id, blockData.text)
      return { ... processedData  }
    },
    'generateText':()=>{}
  },
    
  'graph' :{
    'about':'to add an edge in the knowledge graph',
    'process': (actionData,blockData,options={})=>{
      let newEdge = {v1:"",v2:"",label:""}
      let text = actionData.arguments.text
      let edgeDetails = getGraphStringParts(text)
      const processType = {
        "to-current":()=>{
          newEdge.label = edgeDetails.label
          newEdge.v1 = blockData.id
          newEdge.v2 = getNodeLabelForKG(hashBlockId(edgeDetails.node))
        },
        "from-current":()=>{
          newEdge.label = edgeDetails.label
          newEdge.v2 = blockData.id
          newEdge.v1 = getNodeLabelForKG(hashBlockId(edgeDetails.node))
        },
        "custom":()=>{
          let allValidLabels = options['graph-edge-labels'].keyValueData
          if(!allValidLabels[edgeDetails.label]){
            throw new Error (`Invalid custom graph edge label : ${edgeDetails.label}`)
          }
           
          let customLabel = allValidLabels[edgeDetails.label]
          newEdge.label = customLabel.label
          if(customLabel['input-node']=='v1'){
            newEdge.v2 = blockData.id
            newEdge.v1 = getNodeLabelForKG(hashBlockId(edgeDetails.node))
          }else if(customLabel['input-node']=='v2'){
            newEdge.v1 = blockData.id
            newEdge.v2 = getNodeLabelForKG(hashBlockId(edgeDetails.node))
          }
        },
      }
      processType[edgeDetails.direction]()
      return {newKnowledgeGraphEdge : newEdge }
    }
  }
 }
  
  
const parseDefaultData = (blockText)=>{
    let data = {title: blockText , noLines: 0, linesWithoutTitle:[] }
    let lines = blockText.split("\n")
    const noOfLines = lines.length
    data.noLines = noOfLines
    if(noOfLines > 1){ data.title = lines[0] }
    lines.shift()
    data.linesWithoutTitle = lines
    return data
}
  
const stringToObject = (text)=>{
  // string is of the form "title: text,  one = two , three = four, five = six"
  let parts1 =  text.split(' : ')
  let obj = { key: parts1[0].trim() , value: {}  }
  parts1.shift()
  let remaingString = parts1.join(" : ")
  let data = { text : remaingString  }
  let fields = remaingString.split(",")
  fields.map((field,index)=>{
    let v = field.split(" = ")
    if(v.length == 2){data[v[0].trim()] =  v[1].trim() }
    else if(index == 0){ data['text'] = field}
  })
  obj.value = data
  return obj
}
const dataType = {
  
"key-value": {
    process: (blockId, blockText) => {
      let initialData = parseDefaultData(blockText);
      let keyValueData = {};
      initialData.linesWithoutTitle.map((line) => {
        let l = line.trim()  
        if (l.trim().length > 0  && l[0]=='-') {
          l = l.replace("-","")
          const parsedString = stringToObject(l);
          keyValueData[parsedString.key] = parsedString.value;
        }
      });
      initialData.keyValueData = keyValueData;
      initialData.type = "key-value";
      delete initialData.linesWithoutTitle;
      return { newBlockDataFields: initialData };
    },
    subBlockAccess: true,
    accessSubLevel : (levelDetails, blockData)=>{
      let text = ""
      if(levelDetails.subBlockId != ''){
        text = blockData['keyValueData'][levelDetails.subBlockId]['text']
        if(levelDetails.subSubBlockId != ''){
          text = blockData['keyValueData'][levelDetails.subBlockId][levelDetails.subSubBlockId]
           
        }
      }
      return text
    }
  },  
  
  csv: {
    process: (blockId, blockText) => {
      let initialData = parseDefaultData(blockText);
      let csvData = [];
      initialData.linesWithoutTitle.map((line) => {
        let l = line.trim()  
        if (l.trim().length > 0  && l[0]=='-') {
          l = l.replace("-","")
          const parts = l.split(",");
          csvData.push(parts);
        }
      });
      initialData.csvData = csvData;
      initialData.type = "csv";
      delete initialData.linesWithoutTitle;
      return { newBlockDataFields: initialData };
    },
    subBlockAccess: false,
  },
  
  list: {
    process: (blockId, blockText) => {
      let initialData = parseDefaultData(blockText);
      let listData = ["index item added by default"];
      initialData.linesWithoutTitle.map((line) => {
        let l = line.trim()  
        if (l.trim().length > 0  && l[0]=='-') {
          l = l.replace("-","")
          listData.push({ text: l });
        }
      });
      initialData.listData = listData;
      initialData.type = "list";
      delete initialData.linesWithoutTitle;
      return { newBlockDataFields: initialData };
    },
    subBlockAccess: false,
  },
  
"resource-list": {
    process: (blockId, blockText) => {
      let initialData = parseDefaultData(blockText)
      let resourceData = {}
      initialData.linesWithoutTitle.map((line) => {
        let l = line.trim()  
        if (l.trim().length > 0  && l[0]=='-') {
          l = l.replace("-","")
          let parsedObj = stringToObject(l)
          resourceData[parsedObj.key] = parsedObj.value
        }
      });
      initialData.resourceListData = resourceData;
      initialData.type = "resource-list"
      delete initialData.linesWithoutTitle
      return { newBlockDataFields: initialData }
    },
    subBlockAccess: true,
    accessSubLevel : (levelDetails, blockData)=>{
      let text = ""
      if(levelDetails.subBlockId){
        text = blockData['resourceListData'][levelDetails.subBlockId]['path']
      }
      return text
    }
  },
  
default: {
    process: (blockId, blockText) => {
      let data = parseDefaultData(blockText)
      data.type = "default"
      delete data.linesWithoutTitle
      return { newBlockDataFields: data }
    },
    subBlockAccess: false,
  }, 
}
  
const specialBlocks = [
  {
    name: "outputs",
    type:"key-value",
    note:"To store various output files that can be generated using this doc"
  },
  {
    name: "metadata",
    type:"key-value",
    note:"some meta data related to the doc"
  },
  {
    name: "graph-edge-labels",
    type:"key-value",
    note:"to keep metadata realted to graph edges in the knowledge graph"
  },
  {
    name: "graph-queries",
    type:"key-value",
    note:"to store knowledge graph queries "
  }
] 
  
  
const docToBlocks = (doc,splitter)=>{ return doc.split(splitter)}
  
const randomInteger = (min=0,max=100) => { return Math.floor(Math.random() * (max - min + 1) + min)}  
  
const print = (obj,indent=1)=>{console.log(JSON.stringify(obj,null,indent))} 
  
const getBlankDocObj = ()=>{ return { blocks:[], data:{}}}
  
const getBlankDepGraph = ()=>{
  let newG = graph.createGraph({ title:"Block Dependency graph", hasLoops: false, hasDirectedEdges: true,  isSimple: true })
  return {...newG}
}
  
const getBlankKnowledgeGraph = ()=>{
  let newG = graph.createGraph({ title:"Doc knowledge graph", hasLoops: false, hasDirectedEdges: true,  isSimple: true })
  const defaultVertices = []
  defaultVertices.map(ver=>{ newG = graph.addVertex(newG,{ id: ver, data: {} }) })
  return {...newG}
}
  
const removeSpace = (text) =>{
  let noSpaceText = text.replaceAll(/ +/g,'-')
  noSpaceText = noSpaceText.toLowerCase()
  return noSpaceText
}
  
const hashBlockId = (text)=>{
  let txt = text.trim()
  
let isAppend = false
if(txt[0]=='+'){
  txt = txt.substring(1)
  isAppend = true
}
  
let parts = txt.split(".")
  
txt = parts[0]
txt = removeSpace(txt)
  
let subId = parts.length >= 2 ? parts[1] : ""
subId = removeSpace(subId)
  
let subSubId = parts.length == 3 ? parts[2] : ""
subSubId = removeSpace(subSubId)
  return { isAppend: isAppend, id: txt, subId, subSubId  }
}
  
  
const firstPass = (blocks) => {
  
  let d = getBlankDocObj()
  let g = getBlankDepGraph()
  let kg = getBlankKnowledgeGraph()
  let edgesToAddInDepGraph = []
  
specialBlocks.map(sblock  => {
  d.blocks.push(sblock.name)
  d.data[sblock.name] = {
    rawText: [],
    text:"",
    annotations: { d:{ }, i:{valid: []}, at:{valid: [{action:"data",arguments:{"text": sblock.type }}]}}
  }
  g = graph.addVertex(g,{id:sblock.name})
  kg = graph.addVertex(kg,{id:sblock.name})
})
  blocks.map((block,index)=>{
    if(block){
        
const newBlock = annotations.declaration.extract(block)
const processedText = annotations.declaration.generateText(block)
if(d.blocks.indexOf(newBlock.id)==-1){
  d.blocks.push(newBlock.id)
  let data = {
    rawText: [{block,index}],
    text:processedText,
    annotations: { d:{index, ...newBlock}, i:{valid: []}, at:{valid: []}}
  }
  d.data[newBlock.id] = data
  g = graph.addVertex(g,{id:newBlock.id})
  kg = graph.addVertex(kg,{id:newBlock.id})
}else{
  if(newBlock.isAppend){
    d.data[newBlock.id]['text'] += processedText
    d.data[newBlock.id]['rawText'].push({block,index})
  }
}
        
const allAsmts = annotations.invocation.extract(block)
allAsmts.map(itm=>{
  if(itm.id != newBlock.id){
    d.data[newBlock.id]['annotations']['i']['valid'].push({index,...itm})
    edgesToAddInDepGraph.push({v2:itm.blockId, v1:newBlock.id })
  }
})
        
  
let allActions = annotations.action.extract(block)
  
allActions.map(itm=>{
  d.data[newBlock.id]['annotations']['at']['valid'].push({index,...itm})
})
  
let lookForDataType = d.data[newBlock.id]['annotations']['at']['valid'].find(itm=>{return itm.action == 'data' } )
if(!lookForDataType){
  d.data[newBlock.id]['annotations']['at']['valid'].push({ action:"data", arguments:{ text:"default",d:"0"}})
}
        
d.data[newBlock.id]['finalText'] =  d.data[newBlock.id]['text']
    }
  })
  
edgesToAddInDepGraph.map(edge=>{ try{  g = graph.addEdge(g,edge)}catch(error){} })
  return {d,g,kg}
}
  
const generateProcessingOrder = (blockDep)=>{ return graph.TopologicalSort(blockDep) }
  
  
const invocationText = (invocationData, targetBlockData) =>{
  
let level = 0
if(invocationData.subBlockId){level++}
if(invocationData.subSubBlockId){level++}
  if(level > 0){
    
if( ! dataType[targetBlockData.type]['subBlockAccess'] ){
  throw new Error (`Invalid invocation annotation. The block (id:${targetBlockData.name}) (type: ${targetBlockData.type}) cannot be accessed this way. `)
}
    
let subText = dataType[targetBlockData.type]['accessSubLevel'](invocationData, targetBlockData)
    return subText
  }else{
    return targetBlockData['text']
  }  
}
const secondPass = (docObj, kGraph, vertexOrder) => {
  vertexOrder.map(v=>{
    
let validAct = docObj['data'][v.vertexId]['annotations']['at']['valid']
if(validAct.length > 0){
  validAct.map(act=>{
    
if(actions[act.action]){
  let additionalOptions =  { 
     "graph-edge-labels": docObj['data']['graph-edge-labels']
   }
  let actionEval = actions[act.action]['process'](act,{...docObj['data'][v.vertexId], id: v.vertexId },additionalOptions)
  if(actionEval.newBlockDataFields){
    let newBlockData = { ... docObj['data'][v.vertexId], ... actionEval.newBlockDataFields  }
    docObj['data'][v.vertexId] = newBlockData
  }
  if(actionEval.newKnowledgeGraphEdge){
    kGraph = graph.addEdge(kGraph,actionEval.newKnowledgeGraphEdge)
  }
}
  })
  let mainText2 = docObj['data'][v.vertexId]['text']
  let titleText = docObj['data'][v.vertexId]['title']
  validAct.map(act=>{
    
if(act.rawSource){
  mainText2 = mainText2.replaceAll(`${act.rawSource}`," ")
  titleText = titleText.replaceAll(`${act.rawSource}`," ") 
}
  })
  docObj['data'][v.vertexId]['text'] = mainText2
  docObj['data'][v.vertexId]['title'] = titleText 
}
    
let validAnn = docObj['data'][v.vertexId]['annotations']['i']['valid']
if(validAnn.length > 0){
  let mainText = docObj['data'][v.vertexId]['text']
  validAnn.map(annBlock=>{
    let targetBlockObj = docObj['data'][annBlock.blockId]
    targetBlockObj['name'] = annBlock.blockId
    let invText = invocationText(annBlock,targetBlockObj)
    let annText = docObj['data'][annBlock.blockId]['text']
    mainText = mainText.replaceAll(`${annBlock.rawSource}`,invText)
  }) 
  docObj['data'][v.vertexId]['text'] = mainText
}
  })
  return {blockContent: docObj, knowledgeGraph: kGraph }
} 
  const generateDocObject = (doc,options={})=>{
    try{
      const blocks = docToBlocks(doc,"\n\n")
      let obj = firstPass(blocks)
      let blockContent = obj.d
      let blockDependencyGraph = obj.g
      let knowledgeGraph = obj.kg
      let order =  generateProcessingOrder(blockDependencyGraph)
      let finalValues = secondPass(blockContent,knowledgeGraph,order.vertexInOrder)
      blockContent = finalValues.blockContent
      knowledgeGraph = finalValues.knowledgeGraph
      return {blockContent, blockDependencyGraph, knowledgeGraph, ...order }
    }catch(error){console.log(error)}
  } 
  
const generateOutputDoc = async (doc,options={ type:"file-with-entry"})=>{
  if(!options.type){throw new Error("No doc type specified")}
  const docTypes = {
    "file-with-entry": async ()=>{
      if(!options.main){throw new Error("Specify the main block Id which contains the code")}
      const Document = generateDocObject(doc,options) 
      return Document['blockContent']['data'][options.main]['text']
    },
    "explorer": async ()=>{
      const Document = generateDocObject(doc,options) 
      const allGraphs = [ Document.blockDependencyGraph, Document.knowledgeGraph, Document.dfsTree, Document.tsTree ]
      const graphHTML = await graph.generateGraphPreview(allGraphs,{format:'htmlParts'})
      const sanitizeArrows = (text)=>{
        let sText = text.replaceAll("<","&lt;").replaceAll(">","&gt;")
        return sText
      }
      let explorerHTML = `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Document Explorer</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
              ${graphHTML.head}
            </head>
            <body>
              <style>.graph { width: 90%; height: 80vh; border: 1px solid #80808036; }</style>
              <div class="container-lg">
                <div class="row">
                  <div class="col-lg-12">
                    <h3>Document explorer</h3>
                    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                      <li class="nav-item" role="presentation"> <button class="nav-link active" id="pills-source-tab" data-bs-toggle="pill" data-bs-target="#pills-source" type="button" role="tab" aria-controls="pills-source" aria-selected="true">Source</button></li>
                      <li class="nav-item" role="presentation"><button class="nav-link" id="pills-graph-tab" data-bs-toggle="pill" data-bs-target="#pills-graph" type="button" role="tab" aria-controls="pills-graph" aria-selected="false">Graphs</button></li>
                      <li class="nav-item" role="presentation"><button class="nav-link" id="pills-action-tab" data-bs-toggle="pill" data-bs-target="#pills-action" type="button" role="tab" aria-controls="pills-action" aria-selected="false">Actions</button></li>
                    </ul>
                    <div class="tab-content" id="pills-tabContent">
                      <div class="tab-pane fade show active" id="pills-source" role="tabpanel" aria-labelledby="pills-source-tab" tabindex="0">
                        <div class="row">
                          <div class="col-lg-6"> <h4> Source </h4> <pre>${sanitizeArrows(doc)}</pre></div>
                          <div class="col-lg-6"> <h4> Document object </h4> <pre>${sanitizeArrows(JSON.stringify(Document.blockContent,null,1))}</pre></div>
                        </div>
                      </div>
                      <div class="tab-pane fade" id="pills-graph" role="tabpanel" aria-labelledby="pills-graph-tab" tabindex="0">
                        ${graphHTML.body}
                      </div>
                      <div class="tab-pane fade" id="pills-action" role="tabpanel" aria-labelledby="pills-action-tab" tabindex="0">...</div>
                    </div>
                  </div>
                </div>
              </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
          </html> `
      return explorerHTML
    },
    "kg": async ()=>{
      const Document = generateDocObject(doc,options) 
      const allGraphs = [Document.knowledgeGraph]
      const graphHTML = await graph.generateGraphPreview(allGraphs,{format:'htmlParts'})
      const sanitizeArrows = (text)=>{
        let sText = text.replaceAll("<","&lt;").replaceAll(">","&gt;")
        return sText
      }
      let kgHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document Explorer</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    ${graphHTML.head}
      <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML"></script>
      <script>
      MathJax.Hub.Config({
      showMathMenu: false,
      tex2jax: { inlineMath: [["\$", "\$"]],displayMath:[["\$\$", "\$\$"]] },
      menuSettings: { zoom: "Double-Click", zscale: "150%" },
      CommonHTML: { linebreaks: { automatic: true } },
      "HTML-CSS": { linebreaks: { automatic: true } },
      SVG: { linebreaks: { automatic: true } }
    });
    </script>
  </head>
  <body>
    <style>.graph { width: 90%; height: 80vh; border: 1px solid #80808036;} </style>
    <div class="container-lg">
      <div class="row">
        <div class="col-lg-7">
          ${graphHTML.body}
          <script>
            const blockContent = ${JSON.stringify(Document['blockContent'])}
            network0.on("click", function(event) {
              if (event.nodes.length == 1) {showBlockContent(event.nodes[0])}
            })
            const renderMaths = ()=>{MathJax['Hub'].Queue(["Typeset", MathJax.Hub], 'nodeDetails')}
            let showBlockContent = (blockName) => {
              let blockData = blockContent.data[blockName]
              const convertors = {
                'default': (data) => {
                  return \`<div> \${data.text.replaceAll('\\n','<br>')}</div>\`
                },
                'key-value': (data) => {
                	let objToTable = (obj)=>{
                  	let objKeys = Object.keys(obj)
                    let tab = \`\`
                    if(objKeys.length==1 && objKeys[0]=='text'){
                     tab =  \`<p>\${obj.text}</p>\`
                    }else{
                    	objKeys.map(ky=>{
                      	if(ky=='text'){ tab += \`<p>\${obj[ky]}</p>\` }
                        else{ tab += \`<p> <b>\${ky}</b> : \${obj[ky]} </p>\`}
                      })
                    }
                    return tab
                  }
                	let allkeys = Object.keys(data.keyValueData)
                  let tab= \` \`
                  allkeys.map(ky=>{
                  tab += \`<tr> <td> <b>\${ky}</b></td><td> \${objToTable(data.keyValueData[ky])} </td></tr>\`
                  })
                  return \`<table class="table"> \${tab} </table>\`
                },
                'list': (data) => {
                	let lt = data.listData
                  lt.shift()
                  let litag = ""
                  lt.map(l=>{ litag += \`<li>\${l.text}</li>\`  })
                  return \`<ul>\${litag}</ul>\`
                },
                'resource-list': (data) => {
                  let ress = data.resourceListData
                  let rkeys = Object.keys(ress)
                  let cards = \` \`
                  rkeys.map(res=>{
                  	let rData = ress[res]
                    console.log(rData)
                    cards += \`
                      <div class="card">
  <div class="card-body">
    <h5 class="card-title"><code>\${res}</code> | \${rData.title|| 'Resource'}</h5>
    <p> Path: \${rData.path}</p><a href="\${rData.path}" target="_blank">Open</a></div></div> <br>\`
                  })
                  return cards
                },
                'csv': (data) => {
                	let cv = data.csvData
                  let tab = \`\`
                  cv.map((c,index)=>{
                  	tab += "<tr>"
                  	c.map(cc=>{
                    	if(index==0){ tab += \`<th>\${cc}</th>\`
                      }else{tab += \`<td>\${cc}</td>\`}
                    })
  									tab += "</tr>"
                  })
                  return \`<table class="table table-striped-columns"> \${tab} </table>\`
                }
              }
              let htmlcontent = convertors[blockData.type](blockData)
              const divId = document.getElementById("nodeDetails")
              divId.innerHTML = \`<h3> \${blockName}</h3><hr> \${htmlcontent} \`
						renderMaths()
            }
          </script>
        </div>
        <div class="col-lg-5">
          <div id="nodeDetails">
            <p class="text-secondary">Click on a node to show it's content</p>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-12">
          <details>
            <summary> Details </summary>
            <h4> Source </h4>
            <pre>${sanitizeArrows(doc)}</pre>
            <hr>
            <h4> Document object </h4>
            <pre>${sanitizeArrows(JSON.stringify(Document.blockContent,null,1))}</pre>
          </details>
        </div>
      </div>
    </div>
  </body>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
</html>`
      return kgHTML
    }
  }
  const docContent = await  docTypes[options.type]()
  return docContent
}
  module.exports = { generateDocObject, generateOutputDoc }