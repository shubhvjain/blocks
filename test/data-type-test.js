
  
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
const dataType = {
  "key-value":(blockText)=>{
    let initialData = parseDefaultData(blockText)
    let keyValueData = {}
    initialData.linesWithoutTitle.map(line=>{
      let l = line.replace("-","").trim()
      const parts = l.split(":")
      keyValueData[parts[0].trim()] = parts[1].trim()
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
      const parts = l.split(",")
      csvData.push(parts)
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
      listData.push(l)
    })
    initialData.linesWithoutTitle=[]
    initialData.listData = listData
    initialData.type = "list"
    return initialData
  },
  "resource":(blockText)=>{},
  "code":(blockText)=>{},
  "default":(blockText)=>{
    let data = parseDefaultData(blockText)
    data.type = "default"
    return data
  }
}
  let data = [
    { type:"default", value:` this is a block content. plain , simple text`},
    { type:"default", value:` this is the title of the block
this block is multiline.
the first line in a multiline block is always it's title. this is particularly useful when creating knowledge graphs.`},
    {type:'csv',value:` /[data:csv] this is the title of the csv data
- col1 label, col2 label, col 3 label 
- 1,2,3
- 3,4,5
- 6,7,8` },
    {type:'key-value',value:` /[data:key-value] This is the title of the key value store
- key1 : value of key 1
- key2: value of key2` },
    {type:'list',value:` /[data:list] this is similar to key value pair
- item 1 
- item 2
- item 3
- at this point i will just have the single level of list ` },
  ]
  data.map(dt=>{console.log(dataType[dt.type](dt.value))})