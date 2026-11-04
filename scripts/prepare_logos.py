import xml.etree.ElementTree as ET

svg_path = r"C:\Users\MARIA.ALMEIDA\Downloads\Logo_da_Minerva_Foods.svg"
tree = ET.parse(svg_path)
root = tree.getroot()

# The original has Minerva in #2b3d4a and Foods in #e84752
# Let's create two versions:
# 1) Original with crisp colors
# 2) White/Light version where #2b3d4a is replaced with #ffffff (for dark headers)

with open(svg_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Dark header version: "Minerva" in pure white (#ffffff) and "Foods" in signature red (#e84752)
svg_dark_header = svg_content.replace('fill="#2b3d4a"', 'fill="#ffffff"')

with open(r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\web\public\logo-minerva-light.svg", 'w', encoding='utf-8') as f:
    f.write(svg_dark_header)

with open(r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\web\public\logo-minerva.svg", 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("Logos saved successfully!")
