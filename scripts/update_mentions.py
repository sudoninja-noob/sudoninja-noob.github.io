#!/usr/bin/env python3
import json, os, datetime, feedparser, requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WATCHLIST = os.path.join(ROOT, "data", "watchlist.json")
OUTPUT = os.path.join(ROOT, "data", "mentions.json")

with open(WATCHLIST, "r", encoding="utf-8") as f:
    KEYWORDS = [k.lower() for k in json.load(f)["keywords"]]

def match(text):
    return [k for k in KEYWORDS if k in text.lower()]

items = []

expdb = feedparser.parse("https://www.exploit-db.com/rss.xml")
for e in expdb.entries[:40]:
    hits = match(e.title + e.get("summary",""))
    if hits:
        items.append({"source":"Exploit-DB","title":e.title,"url":e.link,"date":e.published[:10],"tags":hits})

ps = feedparser.parse("https://packetstormsecurity.com/feeds/files/")
for e in ps.entries[:40]:
    hits = match(e.title)
    if hits:
        items.append({"source":"Packet Storm","title":e.title,"url":e.link,"date":e.published[:10],"tags":hits})

kev = requests.get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json").json()
for v in kev.get("vulnerabilities", []):
    hits = match(v.get("cveID","")+" "+v.get("product",""))
    if hits:
        items.append({"source":"CISA KEV","title":v["cveID"],"url":"https://www.cisa.gov/known-exploited-vulnerabilities-catalog","date":v.get("dateAdded",""),"tags":hits})

out = {"updated": datetime.datetime.utcnow().isoformat()+"Z", "items": items[:30]}
with open(OUTPUT,"w",encoding="utf-8") as f:
    json.dump(out,f,indent=2)
