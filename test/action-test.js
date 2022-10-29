

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
const testActionArguments = ()=>{
  console.log(parseActionArguments("test-action1"))
  console.log(parseActionArguments("test-action2:this is just one test argument"))
  console.log(parseActionArguments("test-action3:one, two = tr , three =  this is good  , four= jha ha haa "))
  console.log(parseActionArguments(""))
}
const testActionExtractions = ()=>{
  console.log(annotations.action.extract(`this is the text /[type:one] , /[type1:two, three=four  , five= six seven] , /[eight ] `))
  console.log(annotations.action.extract(` The question is how to specify actions arguments ?
The format of specifying the action itself is fixed i.e. "action-name : arguments"
In most cases there will be a single argument. like : "todo:this" where "this" will the value of the argument named "text". this is the default functioning. if the action has a single agrument then it will be named "text" by default.
But some actions might require multiple arguments. for instance  when specifying the data type of a block as a resource, we also need to specify the location of the resource. 
This makes life simple: if an action has a single argument, no argument name required
In case of actions with multiple arguments, the first argument is always named "text". all other arguments must be named. 
What will be the format of naming them ? : "action-name: text, arg-name= arg-value , arg-name2= arg-value2  "
- arguments are sperated by comma (which means argument content cannot contain comma \[todo: fix this is later version] )
As an example : /[data:resource, location= /path/to/file.pdf , down= true ]`))
}
testActionArguments()
testActionExtractions()