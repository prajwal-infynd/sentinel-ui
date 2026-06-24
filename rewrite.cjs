const fs = require('fs');
let code = fs.readFileSync('src/pages/DataArchitecture.tsx', 'utf8');

// The exact string to replace for the header buttons
const oldHeader = `<div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  <Server className="h-4 w-4" /> Configure API Source
                </Button>
              </DialogTrigger>`;

// We will extract the grid code first
const gridStartStr = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">';
const gridEndStr = '              </div>\n\n              {/* Knowledge Repository List */}';

const gridStart = code.indexOf(gridStartStr);
const gridEnd = code.indexOf(gridEndStr);

if (gridStart === -1 || gridEnd === -1) {
    console.error('Could not find grid bounds');
    process.exit(1);
}

let gridCode = code.substring(gridStart, gridEnd);
gridCode = gridCode.replace('lg:grid-cols-3', 'lg:grid-cols-2');
gridCode = gridCode.replace('lg:col-span-2', 'lg:col-span-1');

// Cut the grid out of the document
code = code.substring(0, gridStart) + code.substring(gridEnd + 48); // skip to after Knowledge Repository List

// Create the new header
const newHeader = `<div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-md text-white">
                  <UploadCloud className="h-4 w-4" /> New Data Source
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl border-none p-0 bg-transparent shadow-none">
                ${gridCode}
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-sm bg-white text-slate-700">
                  <Server className="h-4 w-4" /> Connect API
                </Button>
              </DialogTrigger>`;

code = code.replace(oldHeader, newHeader);

// Fix Tabs
code = code.replace('<h3 className="text-lg font-bold">Architecture Views</h3>', '<h3 className="text-lg font-bold">Indexed Data Sources</h3>');
code = code.replace('<TabsTrigger value="all">Dashboard</TabsTrigger>', '<TabsTrigger value="all">All</TabsTrigger>');

// Also remove the extra div and heading that was left behind
code = code.replace('              <div className="mt-8 mb-4">\n                <h3 className="text-lg font-bold">Indexed Data Sources</h3>\n              </div>\n', '');

fs.writeFileSync('src/pages/DataArchitecture.tsx', code);
console.log('DONE');
