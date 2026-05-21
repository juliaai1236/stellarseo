from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from datetime import datetime, timedelta
import random

app = FastAPI(title="RankRocket")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PORT = int(os.environ.get("COMPANY_PORT", 8000))

# Mock Data
users = [
    {"id": 1, "name": "Sarah Johnson", "email": "sarah@ecobrand.com", "plan": "pro", "active": True, "joined": "2024-01-15"},
    {"id": 2, "name": "Mike Chen", "email": "mike@fashionstore.io", "plan": "enterprise", "active": True, "joined": "2024-02-20"},
    {"id": 3, "name": "Lisa Rodriguez", "email": "lisa@organicmarket.com", "plan": "starter", "active": False, "joined": "2024-03-10"},
    {"id": 4, "name": "Tom Williams", "email": "tom@techgear.co", "plan": "pro", "active": True, "joined": "2024-04-05"},
    {"id": 5, "name": "Emily Park", "email": "emily@homegoods.com", "plan": "enterprise", "active": True, "joined": "2024-01-28"},
    {"id": 6, "name": "James Brown", "email": "james@petstore.com", "plan": "starter", "active": True, "joined": "2024-05-12"},
]

keywords = [
    {"id": 1, "keyword": "organic skincare", "volume": 45000, "difficulty": 72, "cpc": 3.45, "trend": "up"},
    {"id": 2, "keyword": "vegan protein powder", "volume": 28000, "difficulty": 58, "cpc": 4.20, "trend": "up"},
    {"id": 3, "keyword": "sustainable fashion", "volume": 35000, "difficulty": 65, "cpc": 2.80, "trend": "stable"},
    {"id": 4, "keyword": "wireless earbuds", "volume": 62000, "difficulty": 85, "cpc": 5.10, "trend": "down"},
    {"id": 5, "keyword": "home fitness equipment", "volume": 19000, "difficulty": 45, "cpc": 3.90, "trend": "up"},
    {"id": 6, "keyword": "eco-friendly cleaning", "volume": 22000, "difficulty": 52, "cpc": 2.50, "trend": "up"},
    {"id": 7, "keyword": "smart home devices", "volume": 55000, "difficulty": 78, "cpc": 4.75, "trend": "stable"},
    {"id": 8, "keyword": "plant based snacks", "volume": 31000, "difficulty": 48, "cpc": 3.15, "trend": "up"},
]

content_pieces = [
    {"id": 1, "title": "10 Best Organic Skincare Products for 2024", "status": "published", "words": 2500, "seo_score": 88, "created": "2024-06-01", "keywords": ["organic skincare"]},
    {"id": 2, "title": "Ultimate Guide to Vegan Protein Powders", "status": "published", "words": 3200, "seo_score": 92, "created": "2024-06-05", "keywords": ["vegan protein powder"]},
    {"id": 3, "title": "Why Sustainable Fashion Matters Now", "status": "draft", "words": 1800, "seo_score": 75, "created": "2024-06-10", "keywords": ["sustainable fashion"]},
    {"id": 4, "title": "Top Wireless Earbuds Under $100", "status": "published", "words": 2100, "seo_score": 84, "created": "2024-05-20", "keywords": ["wireless earbuds"]},
    {"id": 5, "title": "Home Fitness Equipment That Actually Works", "status": "draft", "words": 2800, "seo_score": 79, "created": "2024-06-15", "keywords": ["home fitness equipment"]},
    {"id": 6, "title": "Eco-Friendly Cleaning Products Guide", "status": "published", "words": 1500, "seo_score": 91, "created": "2024-06-08", "keywords": ["eco-friendly cleaning"]},
    {"id": 7, "title": "Smart Home Devices That Save Energy", "status": "draft", "words": 1950, "seo_score": 82, "created": "2024-06-12", "keywords": ["smart home devices"]},
    {"id": 8, "title": "Best Plant Based Snacks for Athletes", "status": "published", "words": 2300, "seo_score": 86, "created": "2024-05-28", "keywords": ["plant based snacks"]},
]

backlinks = [
    {"id": 1, "source": "forbes.com", "target": "ecobrand.com", "authority": 95, "type": "dofollow", "acquired": "2024-05-01"},
    {"id": 2, "source": "huffpost.com", "target": "fashionstore.io", "authority": 88, "type": "dofollow", "acquired": "2024-05-15"},
    {"id": 3, "source": "businessinsider.com", "target": "organicmarket.com", "authority": 90, "type": "nofollow", "acquired": "2024-05-20"},
    {"id": 4, "source": "techcrunch.com", "target": "techgear.co", "authority": 92, "type": "dofollow", "acquired": "2024-06-01"},
    {"id": 5, "source": "bloomberg.com", "target": "homegoods.com", "authority": 93, "type": "dofollow", "acquired": "2024-06-05"},
    {"id": 6, "source": "entrepreneur.com", "target": "petstore.com", "authority": 85, "type": "nofollow", "acquired": "2024-06-10"},
    {"id": 7, "source": "inc.com", "target": "ecobrand.com", "authority": 87, "type": "dofollow", "acquired": "2024-06-12"},
    {"id": 8, "source": "fastcompany.com", "target": "fashionstore.io", "authority": 89, "type": "dofollow", "acquired": "2024-06-15"},
]

analytics_reports_data = [
    {"id": 1, "name": "Monthly SEO Performance", "type": "monthly", "date": "2024-06-01", "metrics": {"organic_traffic": 125000, "conversion_rate": 3.2, "avg_position": 4.5, "impressions": 850000}},
    {"id": 2, "name": "Keyword Ranking Report", "type": "weekly", "date": "2024-06-10", "metrics": {"total_keywords": 450, "top_3": 85, "top_10": 210, "new_discovered": 28}},
    {"id": 3, "name": "Backlink Audit Q2", "type": "quarterly", "date": "2024-06-15", "metrics": {"total_backlinks": 1250, "new_backlinks": 180, "lost_backlinks": 45, "domain_authority": 62}},
    {"id": 4, "name": "Content Performance", "type": "monthly", "date": "2024-06-01", "metrics": {"total_posts": 85, "avg_engagement": 4.5, "avg_seo_score": 84, "traffic_generated": 45000}},
    {"id": 5, "name": "Competitor Analysis", "type": "monthly", "date": "2024-06-01", "metrics": {"competitors": 12, "avg_rank_vs_competitors": 6.2, "market_share": 8.5, "keyword_overlap": 145}},
    {"id": 6, "name": "Revenue Attribution", "type": "monthly", "date": "2024-06-01", "metrics": {"seo_revenue": 185000, "total_revenue": 520000, "roi": 3.5, "cost_per_lead": 12.50}},
    {"id": 7, "name": "Site Health Scan", "type": "weekly", "date": "2024-06-15", "metrics": {"health_score": 92, "errors": 12, "warnings": 28, "crawlability": 95}},
    {"id": 8, "name": "Local SEO Report", "type": "monthly", "date": "2024-06-01", "metrics": {"local_pack_avg_rank": 3.8, "google_business_views": 2800, "review_count": 156, "avg_rating": 4.6}},
]

# Models
class KeywordRequest(BaseModel):
    keyword: str
    volume: int
    difficulty: int
    cpc: float
    trend: str

class ContentRequest(BaseModel):
    title: str
    keywords: List[str]
    words: int

class BacklinkRequest(BaseModel):
    source: str
    target: str
    authority: int
    type: str

class UserRequest(BaseModel):
    name: str
    email: str
    plan: str

# Endpoints
@app.get("/health")
async def health():
    return {"status": "ok", "app": "RankRocket", "version": "1.0.0"}

@app.get("/api/info")
async def api_info():
    return {
        "name": "StellarSEO",
        "app": "RankRocket",
        "tagline": "AI-Powered SEO for E-commerce Brands",
        "mission": "Helping e-commerce brands rank #1 on Google through automated keyword research, content generation, and link building.",
        "founded": "2022",
        "team_size": 45,
        "clients": 280,
        "avg_rank_improvement": "3.2 positions",
        "monthly_traffic_generated": "8.5M visits"
    }

@app.get("/api/metrics")
async def get_metrics():
    return {
        "total_keywords_tracked": 15200,
        "content_pieces_created": 1850,
        "backlinks_acquired": 12500,
        "active_users": 280,
        "avg_seo_score": 84,
        "monthly_revenue": 520000.00,
        "client_retention_rate": 94.5,
        "avg_organic_traffic_growth": 28
    }

@app.get("/api/stats")
async def get_stats():
    return {
        "daily_active_users": 145,
        "weekly_new_keywords": 320,
        "monthly_content_generated": 85,
        "avg_rank_improvement": 3.2,
        "total_domains": 280,
        "reports_generated": 1250,
        "avg_response_time": 0.42
    }

@app.get("/api/recent-activity")
async def get_recent_activity():
    activities = [
        {"id": 1, "type": "keyword_added", "description": "Added 'organic skincare routine' keyword", "user": "Sarah J.", "timestamp": "2024-06-15T10:30:00Z"},
        {"id": 2, "type": "content_published", "description": "Published '10 Best Organic Skincare Products'", "user": "Mike C.", "timestamp": "2024-06-15T09:45:00Z"},
        {"id": 3, "type": "backlink_acqcuired", "description": "Backlink from forbes.com acquired", "user": "Lisa R.", "timestamp": "2024-06-15T08:20:00Z"},
        {"id": 4, "type": "report_generated", "description": "Monthly SEO Performance report generated", "user": "Tom W.", "timestamp": "2024-06-14T16:00:00Z"},
        {"id": 5, "type": "rank_change", "description": "'wireless earbuds' moved from #7 to #4", "user": "System", "timestamp": "2024-06-14T14:15:00Z"},
        {"id": 6, "type": "user_joined", "description": "New user 'Emily Park' joined", "user": "System", "timestamp": "2024-06-14T12:30:00Z"},
        {"id": 7, "type": "site_scan", "description": "Site health scan completed - 92/100", "user": "System", "timestamp": "2024-06-14T10:00:00Z"},
        {"id": 8, "type": "competitor_update", "description": "Competitor analysis updated - 12 competitors tracked", "user": "James B.", "timestamp": "2024-06-14T09:30:00Z"},
    ]
    return activities

@app.get("/api/chart-data")
async def get_chart_data():
    return {
        "organic_traffic": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "data": [85000, 92000, 105000, 112000, 118000, 125000]
        },
        "keyword_rankings": {
            "labels": ["Top 3", "Top 10", "Top 30", "Top 50", "Top 100"],
            "data": [85, 210, 320, 400, 450]
        },
        "conversion_rate": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "data": [2.8, 3.0, 3.1, 3.0, 3.3, 3.2]
        },
        "backlinks_growth": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "data": [800, 950, 1100, 1150, 1200, 1250]
        }
    }

# Keyword Research Endpoints
@app.get("/api/keywords")
async def get_keywords():
    return {"keywords": keywords}

@app.post("/api/keywords")
async def add_keyword(request: KeywordRequest):
    new_keyword = {
        "id": len(keywords) + 1,
        "keyword": request.keyword,
        "volume": request.volume,
        "difficulty": request.difficulty,
        "cpc": request.cpc,
        "trend": request.trend
    }
    keywords.append(new_keyword)
    return new_keyword

@app.get("/api/keywords/{keyword_id}")
async def get_keyword(keyword_id: int):
    for kw in keywords:
        if kw["id"] == keyword_id:
            return kw
    raise HTTPException(status_code=404, detail="Keyword not found")

# Content Generation Endpoints
@app.get("/api/content")
async def get_content():
    return {"content": content_pieces}

@app.post("/api/content")
async def create_content(request: ContentRequest):
    new_content = {
        "id": len(content_pieces) + 1,
        "title": request.title,
        "status": "draft",
        "words": request.words,
        "seo_score": random.randint(70, 95),
        "created": datetime.now().strftime("%Y-%m-%d"),
        "keywords": request.keywords
    }
    content_pieces.append(new_content)
    return new_content

@app.get("/api/content/{content_id}")
async def get_content_item(content_id: int):
    for c in content_pieces:
        if c["id"] == content_id:
            return c
    raise HTTPException(status_code=404, detail="Content not found")

# Link Building Endpoints
@app.get("/api/backlinks")
async def get_backlinks():
    return {"backlinks": backlinks}

@app.post("/api/backlinks")
async def add_backlink(request: BacklinkRequest):
    new_backlink = {
        "id": len(backlinks) + 1,
        "source": request.source,
        "target": request.target,
        "authority": request.authority,
        "type": request.type,
        "acquired": datetime.now().strftime("%Y-%m-%d")
    }
    backlinks.append(new_backlink)
    return new_backlink

# User Management Endpoints
@app.get("/api/users")
async def get_users():
    return {"users": users}

@app.post("/api/users")
async def add_user(request: UserRequest):
    new_user = {
        "id": len(users) + 1,
        "name": request.name,
        "email": request.email,
        "plan": request.plan,
        "active": True,
        "joined": datetime.now().strftime("%Y-%m-%d")
    }
    users.append(new_user)
    return new_user

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    for u in users:
        if u["id"] == user_id:
            return u
    raise HTTPException(status_code=404, detail="User not found")

# Analytics Reports Endpoints
@app.get("/api/reports")
async def get_reports():
    return {"reports": analytics_reports_data}

@app.get("/api/reports/{report_id}")
async def get_report(report_id: int):
    for r in analytics_reports_data:
        if r["id"] == report_id:
            return r
    raise HTTPException(status_code=404, detail="Report not found")

@app.get("/api/reports/{report_id}/data")
async def get_report_data(report_id: int):
    for r in analytics_reports_data:
        if r["id"] == report_id:
            return r["metrics"]
    raise HTTPException(status_code=404, detail="Report not found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)