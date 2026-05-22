import os
import uuid
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# ---------- Models ----------

class ClientStatus(str, Enum):
    active = "active"
    paused = "paused"
    cancelled = "cancelled"

class Keyword(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    keyword: str
    volume: int
    difficulty: float
    current_rank: Optional[int] = None
    target_url: str
    client_id: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Content(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    word_count: int
    keyword_id: str
    status: str  # draft, published, optimized
    score: Optional[int] = None
    url: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Backlink(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    source_domain: str
    target_url: str
    anchor_text: str
    authority: float  # 0-100
    acquired_date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    client_id: str

class RankingSnapshot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    keyword_id: str
    position: int
    traffic_estimate: int
    date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str
    domain: str
    industry: str
    status: ClientStatus = ClientStatus.active
    monthly_budget: float
    keywords_tracked: int = 0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    email: str
    name: str
    role: str = "member"  # admin, member, viewer
    client_ids: list[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    client_id: str
    type: str  # monthly, weekly, custom
    metrics: dict = Field(default_factory=dict)
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ---------- Mock Database ----------

clients_db: dict[str, Client] = {
    "c001": Client(id="c001", name="EcoBloom", domain="ecobloom.com", industry="ecommerce", monthly_budget=2500.0, keywords_tracked=142),
    "c002": Client(id="c002", name="FitNova Gear", domain="fitnovagear.com", industry="ecommerce", monthly_budget=4800.0, keywords_tracked=289),
    "c003": Client(id="c003", name="PureLeaf Co", domain="pureleaf.co", industry="ecommerce", monthly_budget=1800.0, keywords_tracked=95),
    "c004": Client(id="c004", name="Urban Nest", domain="urbannest.com", industry="ecommerce", monthly_budget=3200.0, keywords_tracked=211),
    "c005": Client(id="c005", name="TechCharge", domain="techcharge.io", industry="ecommerce", monthly_budget=5600.0, keywords_tracked=367),
    "c006": Client(id="c006", name="GreenStep", domain="greenstep.shop", industry="ecommerce", monthly_budget=1500.0, keywords_tracked=78),
    "c007": Client(id="c007", name="ArtisanHome", domain="artisanhome.com", industry="ecommerce", monthly_budget=2900.0, keywords_tracked=176),
    "c008": Client(id="c008", name="BrightMind", domain="brightmind.co", industry="ecommerce", monthly_budget=4100.0, keywords_tracked=254),
}

users_db: dict[str, User] = {
    "u001": User(id="u001", email="sarah@stellarSEO.io", name="Sarah Chen", role="admin", client_ids=["c001","c002","c003","c004","c005","c006","c007","c008"]),
    "u002": User(id="u002", email="marcus@stellarSEO.io", name="Marcus Rivera", role="member", client_ids=["c001","c003","c005"]),
    "u003": User(id="u003", email="lisa@stellarSEO.io", name="Lisa Park", role="member", client_ids=["c002","c004","c006","c008"]),
    "u004": User(id="u004", email="jordan@stellarSEO.io", name="Jordan Taylor", role="viewer", client_ids=["c001","c007"]),
}

keywords_db: dict[str, Keyword] = {}
for i, (kw, vol, diff, rank, client) in enumerate([
    ("organic skincare routine", 12000, 45.2, 3, "c001"),
    ("sustainable activewear brands", 5400, 38.7, 7, "c002"),
    ("plastic free shampoo bars", 8900, 52.1, 11, "c003"),
    ("bamboo bed sheets queen", 6700, 41.5, 5, "c004"),
    ("wireless fast charger 2024", 15000, 63.8, 2, "c005"),
    ("zero waste kitchen essentials", 4300, 29.3, 9, "c006"),
    ("handmade ceramic mugs", 7800, 35.6, 4, "c007"),
    ("natural brain supplements", 11000, 58.4, 6, "c008"),
    ("vegan face serum", 9200, 47.9, 8, "c001"),
    ("compression leggings for running", 6100, 33.2, 1, "c002"),
    ("reusable silicone food bags", 3400, 22.7, 12, "c003"),
    ("organic pillow cases", 4800, 31.8, 10, "c004"),
    ("portable power bank 20000mah", 9800, 55.6, 13, "c005"),
    ("biodegradable trash bags", 2600, 18.4, 15, "c006"),
    ("pottery wheel for beginners", 5100, 27.1, 14, "c007"),
    ("omega 3 brain health", 7600, 49.3, 16, "c008"),
    ("best moisturizer for acne prone skin", 8300, 61.5, 17, "c001"),
    ("wireless headphones for gym", 11200, 59.8, 18, "c002"),
]):
    kid = f"kw{i+1:04d}"
    keywords_db[kid] = Keyword(id=kid, keyword=kw, volume=vol, difficulty=diff, current_rank=rank, target_url=f"https://{clients_db[client].domain}/{kw.replace(' ','-')}", client_id=client, created_at=(datetime.utcnow() - timedelta(days=i*5)).isoformat())

content_db: dict[str, Content] = {}
for i, (title, wc, kid, status, score) in enumerate([
    ("The Ultimate Guide to Organic Skincare Routines", 3200, "kw0001", "published", 89),
    ("Top 10 Sustainable Activewear Brands in 2024", 2400, "kw0002", "published", 92),
    ("Why Plastic Free Shampoo Bars Are Better", 2800, "kw0003", "published", 85),
    ("Best Bamboo Bed Sheets: A Complete Buying Guide", 2600, "kw0004", "published", 88),
    ("Fastest Wireless Chargers for 2024 Tested", 3000, "kw0005", "published", 91),
    ("Zero Waste Kitchen: Essential Products Under $50", 2100, "kw0006", "optimized", 78),
    ("How to Choose Handmade Ceramic Mugs", 1800, "kw0007", "published", 86),
    ("Natural Brain Supplements for Focus & Memory", 3400, "kw0008", "published", 90),
    ("Best Vegan Face Serums for Glowing Skin", 2200, "kw0009", "draft", None),
    ("Compression Leggings for Running: What to Look For", 2500, "kw0010", "published", 87),
    ("Reusable Food Bags vs Plastic: The Ultimate Comparison", 1900, "kw0011", "draft", None),
    ("Organic Pillow Cases: Benefits and Best Picks", 2700, "kw0012", "optimized", 82),
    ("Portable Power Bank Guide: 20000mAh Capacity", 3100, "kw0013", "published", 84),
    ("Biodegradable Trash Bags That Actually Work", 1600, "kw0014", "draft", None),
    ("Pottery Wheel for Beginners: Complete Equipment Guide", 2900, "kw0015", "published", 93),
    ("Omega 3 Brain Supplements: Do They Really Work?", 3500, "kw0016", "optimized", 81),
    ("Best Moisturizer for Acne Prone Skin: Dermatologist Picks", 3300, "kw0017", "published", 79),
    ("Top Wireless Headphones for Gym Workouts in 2024", 2800, "kw0018", "published", 88),
]):
    cid = f"con{i+1:04d}"
    content_db[cid] = Content(id=cid, title=title, word_count=wc, keyword_id=kid, status=status, score=score, url=f"https://blog.stellarSEO.io/{title.lower().replace(' ','-')[:50]}" if status == "published" else None)

backlinks_db: dict[str, Backlink] = {}
import random
domains = ["forbes.com", "nytimes.com", "wsj.com", "hubspot.com", "moz.com", "semrush.com", "ahrefs.com", "searchenginejournal.com", "entrepreneur.com", "techcrunch.com"]
for i in range(30):
    blid = f"bl{i+1:04d}"
    client = random.choice(list(clients_db.keys()))
    kw = [k for k in keywords_db.values() if k.client_id == client]
    if not kw:
        continue
    target = random.choice(kw)
    backlinks_db[blid] = Backlink(
        id=blid,
        source_domain=random.choice(domains),
        target_url=target.target_url,
        anchor_text=target.keyword,
        authority=round(random.uniform(20, 90), 1),
        acquired_date=(datetime.utcnow() - timedelta(days=random.randint(1, 180))).isoformat(),
        client_id=client
    )

rankings_db: dict[str, RankingSnapshot] = {}
for i in range(50):
    rid = f"r{i+1:04d}"
    kw = random.choice(list(keywords_db.values()))
    rankings_db[rid] = RankingSnapshot(
        id=rid,
        keyword_id=kw.id,
        position=random.randint(1, 20),
        traffic_estimate=random.randint(100, 5000),
        date=(datetime.utcnow() - timedelta(days=random.randint(0, 30))).isoformat()
    )

reports_db: dict[str, Report] = {}
for i, (client_id, rtype) in enumerate([
    ("c001", "monthly"), ("c002", "monthly"), ("c003", "monthly"), ("c004", "weekly"),
    ("c005", "monthly"), ("c006", "weekly"), ("c007", "monthly"), ("c008", "weekly"),
    ("c001", "weekly"), ("c003", "weekly"), ("c005", "weekly"), ("c007", "weekly"),
]):
    rid = f"rep{i+1:04d}"
    reports_db[rid] = Report(
        id=rid,
        client_id=client_id,
        type=rtype,
        metrics={
            "total_keywords": random.randint(50, 400),
            "avg_position": round(random.uniform(1, 15), 1),
            "traffic_estimate": random.randint(5000, 50000),
            "backlinks_gained": random.randint(5, 50),
            "content_published": random.randint(2, 15),
            "conversion_rate": round(random.uniform(0.5, 5.0), 2)
        },
        generated_at=(datetime.utcnow() - timedelta(days=random.randint(0, 7))).isoformat()
    )

# ---------- FastAPI App ----------

app = FastAPI(title="StellarRank", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PORT = int(os.environ.get("COMPANY_PORT", 8000))

# ---------- Endpoints ----------

@app.get("/health")
async def health():
    return {"status": "ok", "app": "StellarRank", "version": "1.0.0"}

@app.get("/api/info")
async def info():
    return {
        "name": "StellarSEO",
        "app": "StellarRank",
        "tagline": "AI-powered SEO for e-commerce brands",
        "founded": "2021",
        "team_size": 47,
        "clients_served": 128,
        "total_keywords_tracked": 15680,
        "avg_rank_improvement": "+67%",
        "mission": "Help e-commerce brands dominate Google search using AI-driven keyword research, content generation, and link building automation."
    }

@app.get("/api/metrics")
async def metrics():
    return {
        "total_keywords": 15680,
        "tracked_keywords_change": 342,
        "average_position": 4.8,
        "average_position_change": -0.3,
        "total_content_pieces": 2847,
        "content_published_this_month": 126,
        "total_backlinks": 12840,
        "backlinks_acquired_this_month": 894,
        "active_clients": 128,
        "monthly_recurring_revenue": 284500.0,
        "traffic_estimate_total": 1420000,
        "traffic_estimate_change": 125000,
        "average_domain_authority": 52.3,
        "top3_keywords": 3420,
        "page1_keywords": 7890
    }

@app.get("/api/stats")
async def stats(client_id: Optional[str] = None):
    if client_id and client_id not in clients_db:
        raise HTTPException(404, "Client not found")
    kw_list = [k for k in keywords_db.values() if not client_id or k.client_id == client_id]
    return {
        "keywords_tracked": len(kw_list),
        "keywords_on_page1": sum(1 for k in kw_list if k.current_rank and k.current_rank <= 10),
        "keywords_top3": sum(1 for k in kw_list if k.current_rank and k.current_rank <= 3),
        "avg_position": round(sum(k.current_rank for k in kw_list if k.current_rank) / max(len([k for k in kw_list if k.current_rank]), 1), 2),
        "content_count": len([c for c in content_db.values() if c.keyword_id in [k.id for k in kw_list]]),
        "backlink_count": len([b for b in backlinks_db.values() if b.client_id == client_id or not client_id]),
        "estimated_monthly_traffic": sum(k.volume // max(k.current_rank or 1, 1) for k in kw_list),
        "last_updated": datetime.utcnow().isoformat()
    }

@app.get("/api/recent-activity")
async def recent_activity(limit: int = Query(10, ge=1, le=50)):
    activities = []
    for c in list(content_db.values())[:limit]:
        activities.append({
            "type": "content_published" if c.status == "published" else "content_updated",
            "message": f"Content {'published' if c.status == 'published' else 'updated'}: {c.title[:60]}",
            "timestamp": c.created_at,
            "client_id": keywords_db.get(c.keyword_id, Keyword).client_id if c.keyword_id in keywords_db else None
        })
    for b in list(backlinks_db.values())[:limit]:
        activities.append({
            "type": "backlink_acquired",
            "message": f"Backlink acquired from {b.source_domain}",
            "timestamp": b.acquired_date,
            "client_id": b.client_id
        })
    for k in list(keywords_db.values())[:limit]:
        if k.current_rank:
            activities.append({
                "type": "ranking_change",
                "message": f"Keyword '{k.keyword[:40]}' at position {k.current_rank}",
                "timestamp": k.created_at,
                "client_id": k.client_id
            })
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]

@app.get("/api/chart-data")
async def chart_data(days: int = Query(30, ge=7, le=90)):
    from collections import defaultdict
    daily_data = defaultdict(lambda: {"new_keywords": 0, "content_published": 0, "backlinks_gained": 0, "avg_position_sum": 0, "position_count": 0})
    ref_date = datetime.utcnow()
    for k in keywords_db.values():
        kdate = datetime.fromisoformat(k.created_at)
        diff = (ref_date - kdate).days
        if 0 <= diff < days:
            key = (ref_date - timedelta(days=diff)).strftime("%Y-%m-%d")
            daily_data[key]["new_keywords"] += 1
            if k.current_rank:
                daily_data[key]["avg_position_sum"] += k.current_rank
                daily_data[key]["position_count"] += 1
    for c in content_db.values():
        cdate = datetime.fromisoformat(c.created_at)
        diff = (ref_date - cdate).days
        if 0 <= diff < days:
            key = (ref_date - timedelta(days=diff)).strftime("%Y-%m-%d")
            daily_data[key]["content_published"] += 1
    for b in backlinks_db.values():
        bdate = datetime.fromisoformat(b.acquired_date)
        diff = (ref_date - bdate).days
        if 0 <= diff < days:
            key = (ref_date - timedelta(days=diff)).strftime("%Y-%m-%d")
            daily_data[key]["backlinks_gained"] += 1
    
    all_dates = [(ref_date - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days-1, -1, -1)]
    result = [{
        "date": d,
        "new_keywords": daily_data[d]["new_keywords"],
        "content_published": daily_data[d]["content_published"],
        "backlinks_gained": daily_data[d]["backlinks_gained"],
        "average_position": round(daily_data[d]["avg_position_sum"] / max(daily_data[d]["position_count"], 1), 2) if daily_data[d]["position_count"] > 0 else None
    } for d in all_dates]
    return result

@app.get("/api/clients")
async def get_clients():
    return list(clients_db.values())

@app.get("/api/clients/{client_id}")
async def get_client(client_id: str):
    if client_id not in clients_db:
        raise HTTPException(404, "Client not found")
    return clients_db[client_id]

@app.get("/api/keywords")
async def get_keywords(client_id: Optional[str] = None, page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=100)):
    kw_list = [k for k in keywords_db.values() if not client_id or k.client_id == client_id]
    total = len(kw_list)
    start = (page - 1) * per_page
    end = start + per_page
    return {"total": total, "page": page, "per_page": per_page, "items": kw_list[start:end]}

@app.post("/api/keywords")
async def create_keyword(keyword: Keyword):
    kid = f"kw{len(keywords_db)+1:04d}"
    new_kw = keyword.copy(update={"id": kid})
    keywords_db[kid] = new_kw
    if new_kw.client_id in clients_db:
        clients_db[new_kw.client_id].keywords_tracked += 1
    return new_kw

@app.get("/api/content")
async def get_content(status: Optional[str] = None):
    items = [c for c in content_db.values() if not status or c.status == status]
    return items

@app.post("/api/content")
async def create_content(content: Content):
    cid = f"con{len(content_db)+1:04d}"
    new_con = content.copy(update={"id": cid})
    content_db[cid] = new_con
    return new_con

@app.get("/api/backlinks")
async def get_backlinks(client_id: Optional[str] = None):
    items = [b for b in backlinks_db.values() if not client_id or b.client_id == client_id]
    return items

@app.post("/api/backlinks")
async def create_backlink(backlink: Backlink):
    blid = f"bl{len(backlinks_db)+1:04d}"
    new_bl = backlink.copy(update={"id": blid})
    backlinks_db[blid] = new_bl
    return new_bl

@app.get("/api/rankings")
async def get_rankings(keyword_id: Optional[str] = None, days: int = Query(7, ge=1, le=90)):
    items = [r for r in rankings_db.values() if not keyword_id or r.keyword_id == keyword_id]
    ref_date = datetime.utcnow()
    filtered = [r for r in items if (ref_date - datetime.fromisoformat(r.date)).days <= days]
    return sorted(filtered, key=lambda x: x.date, reverse=True)

@app.get("/api/users")
async def get_users():
    return list(users_db.values())

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    if user_id not in users_db:
        raise HTTPException(404, "User not found")
    return users_db[user_id]

@app.get("/api/reports")
async def get_reports(client_id: Optional[str] = None, type_: Optional[str] = Query(None, alias="type")):
    items = [r for r in reports_db.values() if (not client_id or r.client_id == client_id) and (not type_ or r.type == type_)]
    return items

@app.post("/api/reports")
async def create_report(report: Report):
    rid = f"rep{len(reports_db)+1:04d}"
    new_rep = report.copy(update={"id": rid, "generated_at": datetime.utcnow().isoformat()})
    reports_db[rid] = new_rep
    return new_rep

@app.get("/api/dashboard-summary")
async def dashboard_summary():
    return {
        "active_clients": sum(1 for c in clients_db.values() if c.status == "active"),
        "total_keywords": len(keywords_db),
        "keywords_gaining": sum(1 for k in keywords_db.values() if k.current_rank and k.current_rank <= 5),
        "total_content": len(content_db),
        "published_content": sum(1 for c in content_db.values() if c.status == "published"),
        "total_backlinks": len(backlinks_db),
        "new_backlinks_30d": sum(1 for b in backlinks_db.values() if (datetime.utcnow() - datetime.fromisoformat(b.acquired_date)).days <= 30),
        "recent_reports": len(reports_db),
        "average_client_keywords": round(len(keywords_db) / max(len(clients_db), 1), 1)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)