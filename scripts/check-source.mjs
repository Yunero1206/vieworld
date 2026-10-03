import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import ts from 'typescript';

const root=resolve(import.meta.dirname,'..');
const normalize=file=>file.replaceAll('\\','/');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[normalize(resolve(dir,e.name))]);}
const files=walk(resolve(root,'src')).filter(f=>/\.(tsx?|css)$/.test(f)&&!f.includes('/tests/')&&!f.endsWith('.d.ts'));
const sourceSet=new Set(files), graph=new Map(), errors=new Set();
const routes=[],links=[];
for(const file of files){
  const source=readFileSync(file,'utf8'), refs=[];
  if(file.endsWith('.css')){for(const match of source.matchAll(/@import\s+['"]([^'"]+)['"]/g))refs.push(match[1]);}
  else{
    const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
    function visit(node){
      if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))refs.push(node.moduleSpecifier.text);
      if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))refs.push(node.arguments[0].text);
      if(ts.isJsxAttribute(node)&&node.initializer&&ts.isStringLiteral(node.initializer)){
        if(node.name.text==='path'&&file===normalize(resolve(root,'src/App.tsx')))routes.push(node.initializer.text);
        if(node.name.text==='to')links.push({file,to:node.initializer.text});
      }
      if(ts.isPropertyAssignment(node)&&['to','targetRoute'].includes(node.name.getText(ast).replace(/['"]/g,''))&&ts.isStringLiteral(node.initializer))links.push({file,to:node.initializer.text});
      ts.forEachChild(node,visit);
    }visit(ast);
  }
  const edges=[];
  for(const ref of refs.filter(r=>r.startsWith('.'))){
    const base=normalize(resolve(dirname(file),ref));
    const target=[base,base+'.ts',base+'.tsx',base+'/index.ts',base+'/index.tsx'].find(f=>sourceSet.has(f));
    if(target)edges.push(target);
    else if(!existsSync(base))errors.add(`${relative(root,file)}: missing local import ${ref}`);
  }
  graph.set(file,edges);
}
const reachable=new Set();
function visit(file){if(reachable.has(file))return;reachable.add(file);(graph.get(file)||[]).forEach(visit);}
visit(normalize(resolve(root,'src/main.tsx')));
for(const file of files)if(!reachable.has(file))errors.add(`Unused source module: ${relative(root,file)}`);
const matchers=routes.filter(r=>r!=='*').map(route=>new RegExp('^/'+route.replace(/^\//,'').split('/').map(part=>part.startsWith(':')?'[^/]+':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('/')+'/?$'));
for(const {file,to} of links){
  if(!to.startsWith('/')||to.startsWith('//'))continue;
  if(!matchers.some(pattern=>pattern.test(to.split(/[?#]/)[0])))errors.add(`${relative(root,file)}: link without a matching route ${to}`);
}
console.log(`Source check: ${reachable.size} reachable modules; ${links.length} literal links checked against ${matchers.length} routes.`);
if(errors.size){console.error([...errors].join('\n'));process.exitCode=1;}else console.log('Source/import/route checks passed. Computed links and permissions are covered by regression tests.');
