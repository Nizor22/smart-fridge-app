import re
import os

report_path = r"C:\Users\16468\.gemini\antigravity\scratch\smart-fridge app\SMART_FRIDGE_AI_AUDIT_REPORT.md"
target_dir = r"C:\Users\16468\.gemini\antigravity\scratch\smart-fridge app"

with open(report_path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find ### <number>. <filepath> or similar
# Followed by a code block
pattern = re.compile(r'###\s+\d+\.\s+`?([^`]+)`?.*?\n```[a-z]*\n(.*?)\n```', re.DOTALL)

matches = pattern.findall(content)

target_files = [
    "src/hooks/useAuth.ts",
    "src/hooks/useFridges.ts",
    "src/hooks/useGroceryList.ts",
    "src/hooks/useInventory.ts",
    "src/lib/ai.ts",
    "src/lib/barcode.ts",
    "src/lib/cache.ts",
    "src/lib/expiration.ts",
    "src/lib/notifications.ts",
    "src/lib/supabase.ts",
    "src/context/FridgeContext.tsx",
    "src/constants/theme.ts"
]

target_files_set = set(target_files)
written = []

for filepath, code in matches:
    filepath = filepath.strip()
    if filepath in target_files_set:
        full_path = os.path.join(target_dir, filepath.replace('/', os.sep))
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as out_f:
            out_f.write(code.strip() + "\n")
        written.append(filepath)

print("Written files:")
for w in written:
    print(w)

missing = target_files_set - set(written)
if missing:
    print("Missing files:", missing)

