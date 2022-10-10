
const docToBlocks = (doc,splitter)=>{
  return doc.split(splitter)
}


const getBlankDocObj = ()=>{
  let newObj = {
    blocks:[],
    data:{},
  }
  return {... newObj}
}


const graph = require('./graph')
const getBlankDepGraph = ()=>{
  let newG = graph.createGraph({
    title:"Block Dependency graph",
    hasLoops: false,
    hasDirectedEdges: true, 
    isSimple: true,
  })
  return {...newG}
}



const randomInteger = (min=0,max=100) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
 }

const print = (obj,indent=1)=>{
  console.log(JSON.stringify(obj,null,indent))
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
          asmts.push({
            rawSource: part,
            blockId: hashBlockId(t)['id']
          })
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
            annotations: {
              d:{index, ...newBlock},
              a:{}
            }
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


const generateProcessingOrder = (blockDep)=>{
  const tsort = graph.TopologicalSort(blockDep)
  return tsort
}


const processBlocksInOrder = (docObj, vertexOrder) => {
  vertexOrder.map(v=>{
    let validAnn = docObj['data'][v.vertexId]['annotations']['a']['valid']
    if(validAnn.length > 0){
      let mainText = docObj['data'][v.vertexId]['text']
      validAnn.map(annBlock=>{
        let annText = docObj['data'][annBlock.blockId]['text']
        mainText = mainText.replaceAll(`>[${annBlock.blockId}]`,annText)
      }) 
      docObj['data'][v.vertexId]['text'] = mainText
    }
  })
  return docObj
}


const generateDocObject = (doc,options={})=>{
  try{
    const blocks = docToBlocks(doc,"\n\n")
    let obj = processBlocks(blocks)
    let docObject = obj.d
    let blockDepGraph = obj.g
    let view = [blockDepGraph]
    let order =  generateProcessingOrder(blockDepGraph)
    docObject = processBlocksInOrder(docObject,order.vertexInOrder)
    print(docObject)
    view.push(order.dfsTree)
    view.push(order.tsTree)
    graph.generateGraphPreview(view,{format:'html',outputPath:"sample.html"})
  }catch(error){console.log(error)}
} 


module.exports = {
  docToBlocks,
  getBlankDocObj,
  getBlankDepGraph,
  hashBlockId,
  annotations,
  generateProcessingOrder,
  processBlocksInOrder,
  generateDocObject
}
