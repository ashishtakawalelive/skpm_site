import os
import re

site_dir = r"d:\skpm site"
placeholder = '\n    <div id="footer-placeholder"></div>\n'

html_files = [f for f in os.listdir(site_dir) if f.endswith('.html')]

# Regex to match the full <footer ...>...</footer> block (non-greedy, DOTALL)
footer_pattern = re.compile(r'\n?\s*<footer\b[^>]*>.*?</footer>', re.DOTALL)

replaced = []
skipped = []

for filename in html_files:
    filepath = os.path.join(site_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<footer' not in content:
        skipped.append(filename + ' (no footer found)')
        continue

    new_content = footer_pattern.sub(placeholder, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        replaced.append(filename)
    else:
        skipped.append(filename + ' (no change)')

print(f"\nReplaced footer in {len(replaced)} files:")
for f in replaced:
    print(f"   - {f}")

if skipped:
    print(f"\nSkipped {len(skipped)} files:")
    for f in skipped:
        print(f"   - {f}")
