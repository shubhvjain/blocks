
  
  
const graph = require('./graph')
  
  const BlockSplitCharacter = "\n"
  
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
      return { rawSource, ...blockName}
    },
    generateText: (text)=>{
      const theRegex = /^\.\[([\+]?)([\w\s\-]+?)\]/gm
      return text.replaceAll(theRegex,"")
    }
},
  
invocation: {
    extract: (text) =>{
      const txt = text.trim()
      const theRegex = /\>\[([\w\s\-]+?)\]/gm
      const parts = txt.match(theRegex)
      let asmts = []
      if(parts){
        parts.map(part=>{
          let t = part.replaceAll(">[","")
          t = t.replaceAll("]","")
          asmts.push({ rawSource: part, blockId: hashBlockId(t)['id']})
        })
      }
      return asmts
    }
},
  
action: {
  extract: (text) => {
    const txt = text.trim()
      const theRegex = /\/\[([\s\w\:\,\=\%\.\_\-\/]+?)\]/gm
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
  const parts = argumentText.split(":")
  result.action = parts[0].trim()
  if(parts.length > 1){
    let argParts = parts[1].split(",")
    if(argParts.length>0){
      result.arguments['text'] = argParts[0].trim()
      argParts.shift()
      argParts.map(argu=>{
        let ar = argu.split("=")
        result.arguments[ar[0].trim()] = ar[1].trim()
      })
    }
  }
  return result
}
const actions = {
  'data': {
    'about':'To declare data type for a block',
    'process':()=>{},
    'generateText':()=>{}
  },
  'graph' :{
    'about':'to add an edge in the knowledge graph'
  }
} 
 
  
const parseDefaultData = (blockText)=>{
    let data = {text: blockText , title: blockText , noLines: 0, linesWithoutTitle:[] }
    let lines = blockText.split("\n")
    const noOfLines = lines.length
    data.noLines = noOfLines
    if(noOfLines > 1){ data.title = lines[0] }
    lines.shift()
    data.linesWithoutTitle = lines
    return data
}
const stringToObject = (text)=>{
  // string is of the form "title: one = two , three = four, five = six"
  let parts1 =  text.split(':')
  let data = {}
  let fields = parts1[1].split(",")
  fields.map(field=>{
    let v = field.split("=")
    data[ v[0].trim() ] = v[1].trim()
  })
  return { key: parts1[0].trim() , value : data  }
}
const dataType = {
  "key-value":(blockText)=>{
    let initialData = parseDefaultData(blockText)
    let keyValueData = {}
    initialData.linesWithoutTitle.map(line=>{
      let l = line.replace("-","").trim()
      if(l.trim().length>0){
        const parts = l.split(":")
        keyValueData[parts[0].trim()] = parts[1].trim()
      }
    })
    initialData.linesWithoutTitle=[]
    initialData.keyValueData = keyValueData
    initialData.type = "key-value"
    return initialData    
  },
  "csv":(blockText) => {
    let initialData = parseDefaultData(blockText)
    let csvData = []
    initialData.linesWithoutTitle.map(line=>{
      let l = line.replace("-","").trim()
      if(l.trim().length>0){
        const parts = l.split(",")
        csvData.push(parts)
      }
    })
    initialData.linesWithoutTitle=[]
    initialData.csvData = csvData
    initialData.type = "csv"
    return initialData
  },
  "list":(blockText)=>{
    let initialData = parseDefaultData(blockText)
    let listData = ['index item added by default']
    initialData.linesWithoutTitle.map(line=>{
      let l = line.replace("-","").trim()
      if(l.trim().length>0){
        listData.push({text:l})
      }
    })
    initialData.linesWithoutTitle=[]
    initialData.listData = listData
    initialData.type = "list"
    return initialData
  },
  "resource":(blockText)=>{},
  "resource-list":(blockText)=>{
    let initialData = parseDefaultData(blockText)
    let resourceData = {}
    initialData.linesWithoutTitle.map(line=>{
      let l = line.replace("-","").trim()
      if(l.trim().length>0){
        let parsedObj = stringToObject(l)
        resourceData[parsedObj.key] = parsedObj.value
      }
    })
    initialData.linesWithoutTitle=[]
    initialData.resourceListData = resourceData
    initialData.type = "resource-list"
    return initialData
  },
  "default":(blockText)=>{
    let data = parseDefaultData(blockText)
    data.type = "default"
    return data
  }
}
  
  
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
  return {...newG}
}
  
const hashBlockId = (text)=>{
  let txt = text.trim()
  let isAppend = false
  if(txt[0]=='+'){
    txt = txt.substring(1)
    isAppend = true
  }
  txt = txt.replaceAll(/ +/g,'-')
  txt = txt.toLowerCase()
  return { isAppend: isAppend, id: txt }
}
  

  
const firstPass = (blocks) => {
  
  let d = getBlankDocObj()
  let g = getBlankDepGraph()
  let kg = getBlankKnowledgeGraph()
  let edgesToAdd = []
  blocks.map((block,index)=>{
    if(block){
        
const newBlock = annotations.declaration.extract(block)
const processedText = annotations.declaration.generateText(block)
if(d.blocks.indexOf(newBlock.id)==-1){
  d.blocks.push(newBlock.id)
  let data = {
    rawText: [{block,index}],
    text:processedText,
    annotations: { d:{index, ...newBlock}, i:{}, at:{}}
  }
  d.data[newBlock.id] = data
  g = graph.addVertex(g,{id:newBlock.id})
}else{
  if(newBlock.isAppend){
    d.data[newBlock.id]['text'] += processedText
    d.data[newBlock.id]['rawText'].push({block,index})
  }
}
        
const allAsmts = annotations.invocation.extract(block)
if(!d.data[newBlock.id]['annotations']['i']['valid']){
  d.data[newBlock.id]['annotations']['i']['valid'] = []
}
allAsmts.map(itm=>{
  if(itm.id != newBlock.id){
    d.data[newBlock.id]['annotations']['i']['valid'].push({index,...itm})
    edgesToAdd.push({v2:itm.blockId, v1:newBlock.id })
  }
})
        
  
let allActions = annotations.action.extract(block)
  
let lookForDataType = allActions.find(itm=>{return itm.action == 'data' } )
if(!lookForDataType){
  allActions.push({ action:"data", arguments:{ text:"default",d:"0"}})
}
  
if(!d.data[newBlock.id]['annotations']['at']['valid']){
  d.data[newBlock.id]['annotations']['at']['valid'] = []
}
allActions.map(itm=>{
  d.data[newBlock.id]['annotations']['at']['valid'].push({index,...itm})
})
    }
  })
  edgesToAdd.map(edge=>{g = graph.addEdge(g,edge)})
  return {d,g}
}
  
const processBlocksInOrder = (docObj, vertexOrder) => {
  vertexOrder.map(v=>{
    let validAnn = docObj['data'][v.vertexId]['annotations']['i']['valid']
    if(validAnn.length > 0){
      let mainText = docObj['data'][v.vertexId]['text']
      validAnn.map(annBlock=>{
        let annText = docObj['data'][annBlock.blockId]['text']
        mainText = mainText.replaceAll(`${annBlock.rawSource}`,annText)
      }) 
      docObj['data'][v.vertexId]['text'] = mainText
    }
  })
  return docObj
} 
  
const generateProcessingOrder = (blockDep)=>{ return graph.TopologicalSort(blockDep) }
  const generateDocObject = (doc,options={})=>{
    try{
      const blocks = docToBlocks(doc,"\n\n")
      let obj = firstPass(blocks)
      let blockContent = obj.d
      let blockDependencyGraph = obj.g
      let order =  generateProcessingOrder(blockDependencyGraph)
      blockContent = processBlocksInOrder(blockContent,order.vertexInOrder)
      return {blockContent, blockDependencyGraph, ...order }
    }catch(error){console.log(error)}
  } 
  
const generateOutputDoc = async (doc,options={ type:"file-with-entry"})=>{
  if(!options.type){throw new Error("No doc type specified")}
  const docTypes = {
    "file-with-entry": async ()=>{
      if(!options.main){throw new Error("Specify the main block Id which contains the code")}
      const Document = generateDocObject(doc,options) 
      return Document['docObject']['data'][options.main]['text']
    },
    "explorer": async ()=>{
      const Document = generateDocObject(doc,options) 
      const allGraphs = [ Document.blockDependencyGraph, Document.dfsTree, Document.tsTree ]
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
    }
  }
  const docContent = await  docTypes[options.type]()
  return docContent
}
  module.exports = { docToBlocks, getBlankDocObj, getBlankDepGraph, hashBlockId, annotations, generateProcessingOrder, processBlocksInOrder, generateDocObject, generateOutputDoc }