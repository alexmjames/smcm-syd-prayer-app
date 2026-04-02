import re
import json

with open("Good Friday Prayers.md", "r", encoding="utf-8") as f:
    content = f.read()

# Strip citations
content = re.sub(r'\\?\[cite_start\]', '', content)
content = re.sub(r'\\?\[cite\s*:\s*[\d,\s]*\]', '', content)

lines = content.split('\n')
services = []
current_service = None
current_section = None
current_content = []

def save_section():
    global current_section, current_content
    if current_section:
        current_section["manglish"] = "\n".join(current_content).strip()
        # Clean up empty lines and double newlines
        current_section["manglish"] = re.sub(r'\n{3,}', '\n\n', current_section["manglish"])
        current_content = []

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Clean up escaped hashes
    line = line.replace('\\#', '#')

    if line.startswith('## '):
        save_section()
        title = line[3:].strip().replace('*', '')
        if " - " in title:
             title = title.split(" - ")[-1].strip() # just take the english part maybe? Or keep both. Keep both.
        current_service = {
            "title_manglish": title,
            "sections": []
        }
        services.append(current_service)
        current_section = None

    elif line.startswith('### '):
        save_section()
        if current_service is None:
            current_service = {"title_manglish": "Service", "sections": []}
            services.append(current_service)
        current_section = {
            "title_manglish": line[4:].strip().replace('*', ''),
            "manglish": ""
        }
        current_service["sections"].append(current_section)
    else:
        if current_section is None:
            # If text appears before any ### section, let's create a default one
            if current_service:
                current_section = {"title_manglish": "Aarambham", "manglish": ""}
                current_service["sections"].append(current_section)
            else:
                 continue # Ignore top headers
        
        if current_section:
            # remove some bold markdown if any
            clean_line = line.replace('**', '').replace('\\*', '*')
            clean_line = clean_line.replace('\\-', '-')
            current_content.append(clean_line)

save_section()

with open("temp_parsed.json", "w", encoding="utf-8") as f:
    json.dump(services, f, indent=2, ensure_ascii=False)
