const fs = require('fs');

const content = fs.readFileSync('Good Friday Prayers.md', 'utf-8');

// Strip citations
let processed = content.replace(/\\?\[cite_start\]/g, '');
processed = processed.replace(/\\?\[cite\s*:\s*[\d,\s]*\]/g, '');

const lines = processed.split('\n');
const services = [];
let currentService = null;
let currentSection = null;
let currentContent = [];

function saveSection() {
    if (currentSection) {
        currentSection.manglish = currentContent.join('\n').trim();
        currentSection.manglish = currentSection.manglish.replace(/\n{3,}/g, '\n\n');
        currentContent = [];
    }
}

for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    line = line.replace(/\\#/g, '#');

    if (line.startsWith('## ')) {
        saveSection();
        let title = line.substring(3).trim().replace(/\*/g, '');
        if (title.includes(' - ')) {
            title = title.split(' - ').pop().trim();
        }
        currentService = {
            title_manglish: title,
            sections: []
        };
        services.push(currentService);
        currentSection = null;
    } else if (line.startsWith('### ')) {
        saveSection();
        if (!currentService) {
            currentService = { title_manglish: "Service", sections: [] };
            services.push(currentService);
        }
        currentSection = {
            title_manglish: line.substring(4).trim().replace(/\*/g, ''),
            manglish: ""
        };
        currentService.sections.push(currentSection);
    } else {
        if (!currentSection) {
            if (currentService) {
                currentSection = { title_manglish: "Aarambham", manglish: "" };
                currentService.sections.push(currentSection);
            } else {
                continue;
            }
        }
        if (currentSection) {
            let cleanLine = line.replace(/\*\*/g, '').replace(/\\\*/g, '*').replace(/\\-/g, '-');
            currentContent.push(cleanLine);
        }
    }
}
saveSection();

fs.writeFileSync('temp_parsed.json', JSON.stringify(services, null, 2), 'utf-8');
