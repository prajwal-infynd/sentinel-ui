import re

with open("src/pages/DataArchitecture.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We want to remove the "New Data Source" dialog from the header (lines 225-373 roughly)
# And replace the Tabs structure.
# Because regex can be tricky with nested JSX, let's find exact substrings.

header_start = """          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>"""

header_end = """                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>"""

# Actually, the header block ends right before <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}> <Tabs defaultValue="all" className="w-full">
tabs_start = """        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="all" className="w-full">"""

# Find the start of the action buttons
idx_header_start = content.find(header_start)

# Find the start of the Tabs
idx_tabs_start = content.find(tabs_start)

# The global header action buttons are between idx_header_start and idx_tabs_start.
# We will remove them.
header_actions = content[idx_header_start:idx_tabs_start]

# We need to extract the "Drag & Drop Documents" block, the "Connect API" dialog, and the "Premium Upsell Card" (Request Custom Data)
# Let's extract them by regex or exact strings.

drag_drop = header_actions[header_actions.find("          {/* Universal Drag and Drop */}") : header_actions.find("          {/* Premium Upsell Card */}")]

# The API dialog is at the end of the header actions
api_dialog_start = header_actions.find("            <Dialog>\n              <DialogTrigger asChild>\n                <Button variant=\"outline\" className=\"gap-2 shadow-sm bg-white text-slate-700\">\n                  <Server className=\"h-4 w-4\" /> Connect API")
api_dialog = header_actions[api_dialog_start : header_actions.find("          </div>\n        </motion.div>", api_dialog_start)]

# The Premium Upsell Card is what we want for Custom Data
premium_upsell = header_actions[header_actions.find("          {/* Premium Upsell Card */}") : api_dialog_start]

# We want to change the Premium Upsell Card so it's NOT a dialog trigger, but just the form itself!
# The user said: "move the request custom data into this section" and "they will be requesting it from infynd".
# The form itself is:
form_start = premium_upsell.find("<div className=\"bg-gradient-to-b from-slate-50 to-white px-6 py-8 border-b border-slate-100 flex flex-col items-center text-center\">")
form_end = premium_upsell.find("</DialogContent>")
custom_data_form = premium_upsell[form_start:form_end]
# We'll wrap it nicely.
custom_data_content = f"""
            <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mt-8">
              {custom_data_form}
            </div>
"""

# Let's build the new External Data content
external_data_content = f"""
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {drag_drop}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">API Integrations</h3>
                  <p className="text-muted-foreground text-sm">
                    Connect internal systems directly to the data architecture.
                  </p>
                  <div>
                    {api_dialog}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Indexed Data Sources</h3>
                {{renderList('all')}}
              </div>
            </div>
"""

# Now we need to replace the Tabs structure.
tabs_old_start = content.find("<TabsList className=\"bg-slate-100/80\">", idx_tabs_start)
tabs_old_end = content.find("</TabsList>", tabs_old_start) + len("</TabsList>")

new_tabs_list = """<TabsList className="bg-slate-100/80 p-1 rounded-xl">
                <TabsTrigger value="external" className="rounded-lg">External Data</TabsTrigger>
                <TabsTrigger value="custom" className="rounded-lg">Custom Data</TabsTrigger>
                <TabsTrigger value="infynd" className="rounded-lg">Infynd Data</TabsTrigger>
              </TabsList>"""

# Extract the Master Data Index (TabsContent value="graph")
graph_tab_start = content.find("<TabsContent value=\"graph\">")
graph_tab_end = content.find("            </TabsContent>\n          </Tabs>\n        </motion.div>", graph_tab_start)
master_data_index = content[graph_tab_start + len('<TabsContent value="graph">') : graph_tab_end]

# New Tabs Content
new_tabs_content = f"""
            <TabsContent value="external" className="space-y-6 mt-6">
              {external_data_content}
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-6 mt-6">
              {custom_data_content}
            </TabsContent>
            
            <TabsContent value="infynd" className="space-y-6 mt-6">
              {master_data_index}
            </TabsContent>
"""

# Now assemble everything
part1 = content[:idx_header_start]
# We still need the closing motion.div for the header
part1 += "        </motion.div>\n\n"

part2 = content[idx_tabs_start:tabs_old_start]
part2 = part2.replace('defaultValue="all"', 'defaultValue="external"')

part3 = content[graph_tab_end:]

final_content = part1 + part2 + new_tabs_list + "\n" + new_tabs_content + part3

with open("src/pages/DataArchitecture.tsx", "w", encoding="utf-8") as f:
    f.write(final_content)

print("Rewrote DataArchitecture.tsx")
