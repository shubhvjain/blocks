
  
  
const graph = require('./graph')
  
const BlockSplitCharacter = "\n"
  
  
const docToBlocks = (doc,splitter)=>{ return doc.split(splitter)}
  
const randomInteger = (min=0,max=100) => { return Math.floor(Math.random() * (max - min + 1) + min)}  
  
const print = (obj,indent=1)=>{console.log(JSON.stringify(obj,null,indent))} 
  
const getBlankDocObj = ()=>{ return { blocks:[], data:{}}}
  
const getBlankDepGraph = ()=>{
  let newG = graph.createGraph({ title:"Block Dependency graph", hasLoops: false, hasDirectedEdges: true,  isSimple: true })
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
  
const annotations = {
  declaration: {
    extract:(text)=>{
      // all declarations are in the first annotation block.
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
  assignment: {
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
  }
}
  
  
const processBlocks = (blocks) => {
  let d = getBlankDocObj()
  let g = getBlankDepGraph()
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
            annotations: { d:{index, ...newBlock}, a:{}}
          }
          d.data[newBlock.id] = data
          g = graph.addVertex(g,{id:newBlock.id})
        }else{
          if(newBlock.isAppend){
            d.data[newBlock.id]['text'] += " \n "+processedText
            d.data[newBlock.id]['rawText'].push({block,index})
          }
        }
        const allAsmts = annotations.assignment.extract(block)
        if(!d.data[newBlock.id]['annotations']['a']['valid']){
          d.data[newBlock.id]['annotations']['a']['valid'] = []
        }
        allAsmts.map(itm=>{
          if(itm.id != newBlock.id){
            d.data[newBlock.id]['annotations']['a']['valid'].push({index,...itm})
            edgesToAdd.push({v2:itm.blockId, v1:newBlock.id })
          }
        })
    }
  })
  edgesToAdd.map(edge=>{g = graph.addEdge(g,edge)})
  return {d,g}
}
  
const processBlocksInOrder = (docObj, vertexOrder) => {
  vertexOrder.map(v=>{
    let validAnn = docObj['data'][v.vertexId]['annotations']['a']['valid']
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
      let obj = processBlocks(blocks)
      let docObject = obj.d
      let blockDepGraph = obj.g
      let order =  generateProcessingOrder(blockDepGraph)
      docObject = processBlocksInOrder(docObject,order.vertexInOrder)
      return {docObject, blockDepGraph, ...order }
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
      const allGraphs = [ Document.blockDepGraph, Document.dfsTree, Document.tsTree ]
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
                        <pre>${sanitizeArrows(doc)}</pre>
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