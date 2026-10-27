import {mkdir,copyFile} from 'node:fs/promises';
// Only explicitly public files enter the deployment output.
await mkdir('dist',{recursive:true});
for(const file of ['index.html','styles.css','app.js','weather.js','guidance.js'])await copyFile(file,'dist/'+file);
await copyFile('assets/favicon.svg','dist/favicon.svg');
console.log('Built six public assets in dist/. API functions remain server-side.');
