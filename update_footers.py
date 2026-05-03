import os
import re

footer_html = '''    <footer id="contact" class="footer">
        <div class="container footer-grid-clean">
            <div class="footer-col">
                <img src="logo/s-k-p-m-associates-llp-chartered-accountants-1.png" alt="SKPM logo"
                    class="footer-logo">
                <p style="color: #ccc; font-size:0.9rem;">Your trusted partner for financial, taxation,
                    and corporate governance solutions globally.</p>
                <div class="social-links dark-socials" id="footer-social-links" style="margin-top: 1.5rem;">
                    <!-- Populated via JS Config -->
                </div>
            </div>

            <div class="footer-col">
                <h4>Quick Links</h4>
                <ul style="list-style: none; padding: 0;">
                    <li><a href="index.html#home">Home</a></li>
                    <li><a href="about.html">About Firm</a></li>
                    <li><a href="index.html#industries">Industries</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Useful Links</h4>
                <ul style="list-style: none; padding: 0;">
                    <li><a href="https://www.incometaxindia.gov.in/" target="_blank">Income Tax Dept.</a></li>
                    <li><a href="https://www.tin-nsdl.com/" target="_blank">E-Tax Information Network</a></li>
                    <li><a href="https://www.mca.gov.in/content/mca/global/en/home.html" target="_blank">Ministry of Corporate Affairs</a></li>
                    <li><a href="https://epfindia.com/site_en/" target="_blank">Employees Provident Fund</a></li>
                    <li><a href="https://www.cbic.gov.in/" target="_blank">Central Board of Excise and Custom</a></li>
                </ul>
            </div>

            <div class="footer-col contact-col">
                <h4>Contact Us</h4>
                <ul id="footer-contact-info" style="list-style: none; padding: 0;">
                    <!-- Populated via JS -->
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 SKPM & Associates LLP. All rights reserved.</p>
        </div>
    </footer>'''

directory = '.'

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Regex to find footer block and replace it
        new_content, count = re.subn(r'<footer.*?</footer>', footer_html, content, flags=re.DOTALL)
        
        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Updated {filename}')
