import os
import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Check if replacement is needed
    if 'http://localhost:8000' not in content:
        return
        
    print(f"Fixing: {file_path}")
    
    # 2. Add import if not present
    if 'from "@/lib/api-config"' not in content:
        # Insert after other imports (simplified: after last import or at top)
        if 'import' in content:
            last_import_idx = content.rfind('import')
            next_newline = content.find('\n', last_import_idx)
            content = content[:next_newline+1] + 'import { API_BASE_URL } from "@/lib/api-config";\n' + content[next_newline+1:]
        else:
            content = 'import { API_BASE_URL } from "@/lib/api-config";\n' + content

    # 3. Replace "http://localhost:8000/..." or 'http://localhost:8000/...'
    # Use backticks for the result
    new_content = re.sub(r'["\']http://localhost:8000([^"\']*)["\']', r'`${API_BASE_URL}\1`', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

# Scan list of files identified earlier
files = [
    "frontend/src/app/ai-rd/color/page.tsx",
    "frontend/src/app/ai-rd/consulting/page.tsx",
    "frontend/src/app/ai-rd/library/page.tsx",
    "frontend/src/app/business/copilot/page.tsx",
    "frontend/src/app/business/orders/page.tsx",
    "frontend/src/app/business/quotation/new/page.tsx",
    "frontend/src/app/business/quotation/page.tsx",
    "frontend/src/app/business/settlement/page.tsx",
    "frontend/src/app/business/showroom/page.tsx",
    "frontend/src/app/dashboard/page.tsx",
    "frontend/src/app/development/inquiries/[id]/page.tsx",
    "frontend/src/app/development/inquiries/[id]/proposal/page.tsx",
    "frontend/src/app/development/inquiries/page.tsx",
    "frontend/src/app/development/new-inquiries/page.tsx",
    "frontend/src/app/development/projects/page.tsx",
    "frontend/src/app/page.tsx",
    "frontend/src/app/partners/[id]/page.tsx",
    "frontend/src/app/partners/page.tsx",
    "frontend/src/components/development/project-detail/OutboundTab.tsx",
    "frontend/src/components/development/project-detail/ProductionTab.tsx",
    "frontend/src/components/development/project-detail/ProposalTab.tsx",
    "frontend/src/components/development/project-detail/QualityControlTab.tsx",
    "frontend/src/components/development/project-detail/SamplingTab.tsx",
    "frontend/src/components/layout/Navbar.tsx",
    "frontend/src/components/workflow/InquiryWizard.tsx"
]

for f in files:
    if os.path.exists(f):
        fix_file(f)
    else:
        print(f"File not found: {f}")

print("All files processed!")
