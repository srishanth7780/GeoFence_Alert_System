import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/App.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace(
  `import { useState, useEffect, useCallback, useRef } from "react";`,
  `import { useState, useEffect, useCallback, useRef } from "react";\nimport { motion, AnimatePresence } from "framer-motion";`
);

// 2. Sidebar buttons
content = content.replace(
  /<button\s+key=\{id\}\s+onClick=\{\(\) => setActive\(id\)\}\s+className=\{`\s+w-full flex items-center gap-3 px-3 py-2\.5 rounded-lg text-sm font-medium transition-all/g,
  `<motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              key={id}
              onClick={() => setActive(id)}
              className={\`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden`
);
content = content.replace(
  /\{!collapsed && isActive && <ChevronRight className="w-3 h-3 ml-auto" \/>\}\n\s+<\/button>/g,
  `{!collapsed && isActive && <ChevronRight className="w-3 h-3 ml-auto relative z-10" />}\n            </motion.button>`
);
// Also adjust icons and spans to be relative z-10 for the sidebar if needed, but not strictly necessary if no absolute bg. I'll just leave it since the previous replace handles the button tags.

// 3. StatCard
content = content.replace(
  /<div className=\{`\s+rounded-xl border bg-gradient-to-br p-5 \$\{colors\[color\]\}\s+\$\{dark \? "bg-slate-900" : "bg-white"\}\s+`\}>/g,
  `<motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={\`
      rounded-xl border bg-gradient-to-br p-5 \${colors[color]}
      \${dark ? "bg-slate-900" : "bg-white"}
    \`}>`
);
content = content.replace(
  /<Icon className=\{`w-5 h-5 \$\{colors\[color\]\.split\(" "\)\.at\(-1\)\}`\} \/>\n\s+<\/div>\n\s+<\/div>\n\s+<\/div>/g,
  `<Icon className={\`w-5 h-5 \${colors[color].split(" ").at(-1)}\`} />\n        </div>\n      </div>\n    </motion.div>`
);

// 4. AlertItem
content = content.replace(
  /<div className=\{`\s+flex items-start gap-3 p-3 rounded-lg border transition-all\s+\$\{!alert\.is_read/g,
  `<motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={\`
      flex items-start gap-3 p-3 rounded-lg border transition-all
      \${!alert.is_read`
);
// Replace the closing div for AlertItem. It's tricky with regex, let's just do a specific replace.
// In AlertItem component:
content = content.replace(
  /Mark read\n\s+<\/button>\n\s+\)\}\n\s+<\/div>\n  \);\n\}/g,
  `Mark read\n        </button>\n      )}\n    </motion.div>\n  );\n}`
);

// 5. DashboardView Alert list
content = content.replace(
  /<div className="space-y-2 max-h-64 overflow-y-auto pr-1">\n\s+\{alerts\.slice\(0, 6\)\.map\(a => \(\n\s+<AlertItem key=\{a\.id\} alert=\{a\} onMarkRead=\{\(\) => \{\}\} dark=\{dark\} \/>\n\s+\)\)\}\n\s+<\/div>/g,
  `<div className="space-y-2 max-h-64 overflow-y-auto pr-1">\n          <AnimatePresence initial={false}>\n            {alerts.slice(0, 6).map(a => (\n              <AlertItem key={a.id} alert={a} onMarkRead={() => {}} dark={dark} />\n            ))}\n          </AnimatePresence>\n        </div>`
);

// 6. AlertsView Alert list
content = content.replace(
  /\{filtered\.map\(a => \(\n\s+<div key=\{a\.id\} className=\{`flex items-start gap-3 p-4 rounded-xl border transition-all\s+\$\{!a\.is_read/g,
  `<AnimatePresence initial={false}>\n          {filtered.map(a => (\n            <motion.div\n              layout\n              initial={{ opacity: 0, y: 20 }}\n              animate={{ opacity: 1, y: 0 }}\n              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}\n              whileHover={{ scale: 1.01 }}\n              key={a.id} className={\`flex items-start gap-3 p-4 rounded-xl border transition-all\n              \${!a.is_read`
);
// Closing div for AlertsView loop
content = content.replace(
  /Mark read\n\s+<\/button>\n\s+\)\}\n\s+<\/div>\n\s+\)\)\}/g,
  `Mark read\n              </button>\n            )}\n            </motion.div>\n          ))}\n        </AnimatePresence>`
);

// 7. Page transitions in App
content = content.replace(
  /<div className="flex-1 overflow-y-auto p-6">\n\s+\{views\[activeView\]\}\n\s+<\/div>/g,
  `<div className="flex-1 relative overflow-hidden">\n          <AnimatePresence mode="wait">\n            <motion.div\n              key={activeView}\n              initial={{ opacity: 0, x: 20 }}\n              animate={{ opacity: 1, x: 0 }}\n              exit={{ opacity: 0, x: -20 }}\n              transition={{ duration: 0.3, ease: "easeOut" }}\n              className="absolute inset-0 p-6 overflow-y-auto"\n            >\n              {views[activeView]}\n            </motion.div>\n          </AnimatePresence>\n        </div>`
);

// 8. Devices table row animation
content = content.replace(
  /<tbody>\n\s+\{filtered\.map\(d => \(\n\s+<tr key=\{d\.id\} className=\{`border-b text-sm transition-colors/g,
  `<tbody>\n              <AnimatePresence>\n              {filtered.map(d => (\n                <motion.tr\n                  layout\n                  initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  exit={{ opacity: 0, scale: 0.95 }}\n                  key={d.id} className={\`border-b text-sm transition-colors`
);
content = content.replace(
  /<Trash2 className="w-3\.5 h-3\.5" \/>\n\s+<\/button>\n\s+<\/td>\n\s+<\/tr>\n\s+\)\)\}\n\s+<\/tbody>/g,
  `<Trash2 className="w-3.5 h-3.5" />\n                    </button>\n                  </td>\n                </motion.tr>\n              ))}\n              </AnimatePresence>\n            </tbody>`
);

// 9. Geofences animation
content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">\n\s+\{geofences\.map\(g => \(\n\s+<div key=\{g\.id\} className=\{`rounded-xl border p-5 transition-all \$\{dark \? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"\}\s+\$\{g\.is_active \? "" : "opacity-60"`\}\}>/g,
  `<motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">\n        <AnimatePresence>\n        {geofences.map(g => (\n          <motion.div \n            layout\n            initial={{ opacity: 0, scale: 0.9 }}\n            animate={{ opacity: 1, scale: 1 }}\n            exit={{ opacity: 0, scale: 0.8 }}\n            whileHover={{ y: -5, boxShadow: dark ? "0 10px 30px -10px rgba(6,182,212,0.2)" : "0 10px 30px -10px rgba(0,0,0,0.1)" }}\n            key={g.id} className={\`rounded-xl border p-5 transition-all \${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}\n            \${g.is_active ? "" : "opacity-60"}\`}>`
);
content = content.replace(
  /\{g\.is_active \? "● Active" : "○ Inactive"\}\n\s+<\/span>\n\s+<\/div>\n\s+<\/div>\n\s+\)\)\}\n\s+<\/div>/g,
  `{g.is_active ? "● Active" : "○ Inactive"}\n              </span>\n            </div>\n          </motion.div>\n        ))}\n        </AnimatePresence>\n      </motion.div>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done modifying App.jsx');
