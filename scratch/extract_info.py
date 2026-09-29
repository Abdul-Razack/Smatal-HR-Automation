import urllib.request
import re

req = urllib.request.Request('https://www.smatal.in/assets/index-DEighfkq.js', headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

print('=== EMAILS ===')
for email in set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)):
    print(email)

print('=== PHONES ===')
for phone in set(re.findall(r'(?:\+?91[\s-]?)?[6-9]\d{9}', content)):
    print(phone)

print('=== MENTIONS OF SMATAL / COMPANY ===')
for m in set(re.findall(r'([A-Za-z0-9\s,.-]{5,40}Smatal[A-Za-z0-9\s,.-]{0,40})', content, re.IGNORECASE)):
    print('-', m.strip())

print('=== ADDRESS / CONTACT FRAGMENTS ===')
for m in set(re.findall(r'"([^"]*(?:Triplicane|Chennai|Tamil Nadu|Complex|Floor|High Road)[^"]*)"', content, re.IGNORECASE)):
    print('ADDR:', m)
