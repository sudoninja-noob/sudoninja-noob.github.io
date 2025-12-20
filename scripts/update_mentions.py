#!/usr/bin/env python3
import json, os, datetime, feedparser, requests
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WATCH=os.path.join(ROOT,"data","watchlist.json")
OUT=os.path.join(ROOT,"data","mentions.json")
KEY=[k.lower() for k in json.load(open(WATCH))["keywords"]]
def m(t): return [k for k in KEY if k in t.lower()]
items=[]
for e in feedparser.parse("https://www.exploit-db.com/rss.xml").entries[:40]:
    h=m(e.title+e.get("summary",""))
    if h: items.append({"source":"Exploit-DB","title":e.title,"url":e.link,"date":e.published[:10],"tags":h})
for e in feedparser.parse("https://packetstormsecurity.com/feeds/files/").entries[:40]:
    h=m(e.title)
    if h: items.append({"source":"Packet Storm","title":e.title,"url":e.link,"date":e.published[:10],"tags":h})
kev=requests.get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json").json()
for v in kev.get("vulnerabilities",[]):
    h=m(v.get("cveID","")+" "+v.get("product",""))
    if h: items.append({"source":"CISA KEV","title":v["cveID"],"url":"https://www.cisa.gov/known-exploited-vulnerabilities-catalog","date":v.get("dateAdded",""),"tags":h})
json.dump({"updated":datetime.datetime.utcnow().isoformat()+"Z","items":items[:30]},open(OUT,"w"),indent=2)
