const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove useWindowWidth and useIsMobile functions
code = code.replace(/function useWindowWidth\(\) \{[\s\S]*?\}\n\nfunction useIsMobile\(\) \{[\s\S]*?\}\n\n/g, '');

// 2. Remove isMobile and isTablet hooks usage
code = code.replace(/const isMobile = useIsMobile\(\);\n/g, '');
code = code.replace(/const windowWidth = useWindowWidth\(\);\n/g, '');
code = code.replace(/const isTablet = windowWidth >= 768 && windowWidth < 1150;\n/g, '');

// Replace "if (isMobile) {" with just "return (" (and wrap everything inside a fragment so modales can be appended)
// The mobile layout starts at:
//   if (isMobile) {
//     return (
//       <div style={{ position: 'relative'
code = code.replace("if (isMobile) {\n    return (\n      <div style={{ position: 'relative'", "return (\n    <>\n      <div style={{ position: 'relative'");

// The mobile layout ends at:
//           </div>
//         </div>
//       </div>
//     );
//   }
//
//   // ========== DESKTOP LAYOUT ==========
const mobileEndMarker = "        </div>\n      </div>\n    );\n  }\n\n  // ========== DESKTOP LAYOUT ==========";
code = code.replace(mobileEndMarker, "        </div>\n      </div>");

// Now we need to remove the desktop layout up to the modals.
// The desktop layout goes from:
//   return (
//     <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
//
// To the modals:
//       {/* Timetable Modal (Desktop) */}
//       {viewingSchedule && <TimetableModal routeCode={viewingSchedule} onClose={() => setViewingSchedule(null)} />}
const desktopStartMarker = "  return (\n    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>";
const desktopEndMarker = "      {/* Timetable Modal (Desktop) */}";

const startIdx = code.indexOf(desktopStartMarker);
const endIdx = code.indexOf(desktopEndMarker);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + code.substring(endIdx);
}

// Finally, we need to add the closing </> fragment at the end, right before the closing bracket of App
// The end of the file looks like:
//         </div>
//       )}
//     </div>
//   );
// }
// 
// export default App;
code = code.replace("      )}\n    </div>\n  );\n}", "      )}\n    </>\n  );\n}");

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Cleanup done!");
