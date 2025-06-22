let _log=console.log
console.log=function(...args){
  var x=new Error();
  _log.apply(console,args)
  
  let st=x.stack.split('\n')
  let st2= st?.[2]?.match?.(/(?<=\/)[^\/:]+:[0-9]+/)?.[0] || ''
  let st3= st?.[3]?.match?.(/(?<=\/)[^\/:]+:[0-9]+/)?.[0] || ''
  _log('\t\t\t\t\x1b[90m' + st2+ ', ' + st3 + '\x1b[0m')
}
module.exports={}