API Overview
Unofficial Tapology MMA API: Access fighter profiles, upcoming event schedules, and fight history. • Comprehensive fighter profiles with details and stats • Upcoming Event schedules per subregion • Up-to-date upcoming, cancelled and past fight results • Coverage of both amateur and professional fighters worldwide Powered by Tapology, the world's largest fight database, for real-time accuracy.

Unofficial Tapology MMA API v1.2.0 - v1.3.0
VersionPythonFastAPIRedis

An optimized, high-performance API for retrieving MMA fighter information and event schedules with Redis caching.

<div> <h3>📋 OVERVIEW 📋</h3> </div>
The Unofficial Tapology MMA API provides comprehensive information about MMA fighters worldwide, including personal information, historical results, and upcoming & past events schedules. The data is sourced in real-time from Tapology and cached efficiently using Redis.

⚠️ Disclaimer: This API is not endorsed or sponsored by Tapology. It is an unofficial service provided for informational purposes only.

<div> <h3> 💡 FEATURES 💡 </h3> </div>
Fighter Profiles: Access detailed information about MMA fighters
Fight Results: Retrieve historical fight data for any fighter
Event Schedules: Get information on upcoming and past events
Optimized Performance: Redis caching for faster response times
Circuit Breaker Pattern: Built-in resilience against upstream service failures
Structured JSON Responses: Well-formatted data for easy integration
<div> <h3> ⚙️ TECH STACK ⚙️</h3> </div>
FastAPI: Modern, high-performance web framework
Redis: Advanced caching layer for optimized performance
Python 3.12: Leveraging the latest language features
Docker: Containerized deployment for consistent environments
Async Processing: Non-blocking I/O for efficient request handling
<div> <h3>🛣️ API ENDPOINTS 🛣️</h3> </div>
<div> <h3> 👊 FIGHTER ENDPOINTS 👊 </h3> </div>
Get Fighter Profile
GET /api/fighter/{fighter_id}
Retrieve detailed information about a fighter.

Path Parameters:

fighter_id (string, required): Unique identifier for the fighter (e.g., georges-st-pierre-rush)
Query Parameters:

fields (string, optional): Comma-separated list of fields to include in response
Response Fields:

| Field | Type | Description | |-------|------|-------------| | firstname | string | Fighter's first name | | lastname | string | Fighter's last name | | nickname | string | Fighter's commonly known alias | | age | string | Fighter's current age | | date_of_birth | string | Fighter's birth date (YYYY MMM DD) | | born | string | Fighter's place of birth | | weight_class | string | Fighter's current weight division | | last_weigh_in | string | Fighter's weight at most recent weigh-in | | full_record | string | Fighter's complete win-loss-draw record | | current_streak | string | Fighter's current win/loss streak | | last_fight | string | Date and organization of most recent bout | | wins | integer | Total number of wins | | losses | integer | Total number of losses | | draws | integer | Total number of draws | | no_contest | integer | Total number of no contests | | tko_ko | object | Contains wins and losses by TKO/KO | | submission | object | Contains wins and losses by submission | | decision | object | Contains wins and losses by decision | | disqualification | object | Contains wins and losses by disqualification |

Get Multiple Fighter Profiles (Bulk Request)
GET /api/fighter/profiles/{fighter_id}
Retrieve multiple fighter profiles with a single request.

Query Parameters:

fighter_id (string, required): Comma-separated fighter IDs (max 3)
fields (string, optional): Comma-separated list of fields to include in response
Example Request:

GET /api/fighter/profiles/fighter_id=georges-st-pierre-rush,117305-alex-pereira
Example Response:

{
  "fighters": {
    "georges-st-pierre-rush": {
      "firstname": "Georges",
      "lastname": "St-Pierre",
      "nickname": "Rush",
      "age": "43",
      "date_of_birth": "1981 May 19",
      "born": "St. Isidore, Quebec, Canada",
      "weight_class": "Middleweight",
      "last_weigh_in": "184.4 lbs",
      "full_record": "26-2-0",
      "current_streak": "13 Wins",
      "last_fight": "November 04, 2017 in UFC",
      "wins": 26,
      "losses": 2,
      "draws": 0,
      "no_contest": 0,
      "tko_ko": {
        "wins": 8,
        "losses": 1
      },
      "submission": {
        "wins": 6,
        "losses": 1
      },
      "decision": {
        "wins": 12,
        "losses": 0
      }
    },
    "117305-alex-pereira": {
      "firstname": "Alex",
      "lastname": "Pereira",
      "nickname": "Poatan",
      "age": "37",
      "date_of_birth": "1987 Jul 07",
      "born": "São Bernardo do Campo, São Paulo, Brazil",
      "weight_class": "Light Heavyweight",
      "last_weigh_in": "205.0 lbs",
      "full_record": "12-3-0",
      "current_streak": "1 Loss",
      "last_fight": "March 08, 2025 in UFC",
      "wins": 12,
      "losses": 3,
      "draws": 0,
      "no_contest": 0,
      "tko_ko": {
        "wins": 10,
        "losses": 1
      },
      "submission": {
        "wins": 0,
        "losses": 1
      },
      "decision": {
        "wins": 2,
        "losses": 1
      }
    }
  }
}
Get Fighter Fight History Results
GET /api/fighter/result/{fighter_id}
Retrieve the fight history and results for a fighter.

Path Parameters:

fighter_id (string, required): Unique identifier for the fighter (e.g., 117305-alex-pereira)
Query Parameters:

fields (string, optional): Comma-separated list of fields to include in response
Response Fields:

| Field | Type | Description | |-------|------|-------------| | result | string | Outcome of the fight (win, loss, draw, etc.) | | cancellation_reason | string | Reason for cancellation (if applicable) | | fighter_name | string | Name of the fighter | | opponent_name | string | Name of the opponent | | fighter_record_before_fight | string | Fighter's record before this fight | | opponent_record_before_fight | string | Opponent's record before this fight | | event | string | Name of the event | | event_date | string | Date of the event (YYYY-MM-DD) | | level | string | Level of the fight (pro or amateur) | | title_bout | boolean | Whether this was a title fight | | billing | string | Placement on fight card | | status_before_fight | string | Fighter status before the fight | | weight | string | Weight for the fight | | weigh_in_result | string | Weigh-in result | | duration | string | Duration of the fight | | odds | string | Betting odds | | referee | string | Name of the referee | | fight_award | string | Any awards received (FOTN, etc.) | | disclosed_pay | string | Disclosed fighter pay (if available) |

Get Multiple Fighter Results (Bulk Request)
GET /api/fighter/results/{fighter_id}
Get multiple fighters' fight results with a single request.

Query Parameters:

fighter_id (string, required): Comma-separated fighter IDs (max 3)
fields (string, optional): Comma-separated list of fields to include in response
Example Request:

GET /api/fighter/results/fighter_id=99747-mauricio-rufy,36554-carlos-prates-carlao
Example Response:

{
  "results_by_fighter": {
    "99747-mauricio-rufy": [
      {
      "opponent_name": "King Green",
      "fighter_record_before_fight": "11-1",
      "opponent_record_before_fight": "32-16-1",
      "result": "win",
      "method": "Spinning Heel Kick · 2:07 · R1",
      "event": "UFC 313: Pereira vs. Ankalaev",
      "event_date": "2025-03-08",
      "level": "pro",
      "billing": "Main Card",
      "weight": "Lightweight · 155 lbs (70.3 kg)",
      "weigh_in_result": "155.5 lbs (70.5 kgs)",
      "duration": "3 x 5 Minute Rounds",
      "odds": "-480 · Heavy Favorite",
      "referee": "Chris Tognoni",
      "fight_award": "UFC 313 Performance of the Night",
      "disclosed_pay": "$50,000 Perf/Night"
      },
    ],
    "36554-carlos-prates-carlao": [
      {
      "fighter_name": "Geoff Neal",
      "result": "cancelled",
      "cancellation_reason": "Neal Withdrew",
      "event": "UFC 314: Volkanovski vs. Lopes",
      "event_date": "2025-04-12",
      "level": "pro",
      "weight": "Welterweight · 170 lbs (77.1 kg)"
    },
    {
      "opponent_name": "Neil Magny",
      "fighter_record_before_fight": "20-6",
      "opponent_record_before_fight": "29-12",
      "result": "win",
      "method": "Left Hook · 4:50 · R1",
      "event": "UFC Fight Night",
      "event_date": "2024-11-09",
      "level": "pro",
      "billing": "Main Event",
      "weight": "Welterweight · 170 lbs (77.1 kg)",
      "weigh_in_result": "170.5 lbs (77.3 kgs)",
      "duration": "5 x 5 Minute Rounds",
      "odds": "-800 · Huge Favorite",
      "referee": "Mark Smith",
      "fight_award": "UFC Fight Night Performance of the Night",
      "disclosed_pay": "$50,000 Perf/Night"
      }
    ]
  }
}
<div> <h3>🎟️ EVENT ENDPOINTS 🎟️️ </h3> </div>
Get Upcoming Events Schedule
GET /api/schedule/events/{region_id}
Retrieve the schedule of upcoming MMA events for a specific region.

Path Parameters:

region_id (integer, required): Region ID (1-121)
Query Parameters:

fields (string, optional): Comma-separated list of fields to include in response
Response Fields:

| Field | Type | Description | |-------|------|-------------| | organization | string | Name of the organization hosting the event | | main_event | string | Main event or headlining fight | | weight_class | string | Weight class of the main event | | datetime | string | Date and time of the event | | city | string | City where the event takes place | | subregion | string | Subregion or broader geographic area | | broadcast | string | Broadcast information | | title_bout_desc | string | Title bout description (if applicable) | | fight_card | object | Details of all scheduled fights |

Get Multiple Regions' Upcoming Events (Bulk Request)
GET /api/schedule/events/{regions_id}
Get events schedule for multiple regions in a single call.

Query Parameters:

regions_id (string, required): Comma-separated region IDs (max 3)
fields (string, optional): Comma-separated list of fields to include in response
Example Request:

GET /api/schedule/events/regions_id=16,69&fields=organization,main_event,datetime
Example Response:

{
  "events_by_region": {
    "16": [
      {
        "organization": "UFC Fight Night: Lewis vs. Spivac",
        "main_event": "Lewis vs. Spivac",
        "datetime": "Saturday, April 19, 7:00 PM ET"
      },
      {
        "organization": "PFL 2025 #3",
        "main_event": "MacFarlane vs. Rodriguez",
        "datetime": "Friday, April 25, 9:00 PM ET"
      }
    ],
    "69": [
      {
        "organization": "UFC 300: Jones vs. Miocic",
        "main_event": "Jones vs. Miocic",
        "datetime": "Saturday, April 12, 10:00 PM ET"
      }
    ]
  }
}
Get Past Events
GET /api/schedule/past-events/{region_id}
Get past events schedule for a specific region with enhanced fight card details.

Path Parameters:

region_id (integer, required): Region ID (1-121)
Query Parameters:

fields (string, optional): Comma-separated list of fields to include in response
page (integer, optional): Page number for pagination (default: 1)
Example Request:

GET /api/schedule/past-events/region_id=69?page=1
Example Response:

{
  "events": [
    {
      "organization": "Clinch Fight Club 10",
      "main_event": "Cannon vs. Nunn",
      "datetime": "Saturday, March 22, 10:00 PM ET",
      "city": "Vancouver, WA",
      "subregion": "US West Region",
      "fight_card": {
        "fight_6": {
          "fight": "James Cannon def Brandon Nunn",
          "outcome": "Rear Naked Choke · 2:27 · R1",
          "weight_class": "205"
        },
        "fight_5": {
          "fight": "Esteban Gonzalez Martinez def Jason Shaner",
          "outcome": "KO/TKO · 3:45 · R1",
          "weight_class": "125"
        },
        "fight_4": {
          "fight": "Adrian Lyons-Lopez def Jonathan Hanes",
          "outcome": "Decision · Unanimous",
          "weight_class": "170"
        },
        "fight_3": {
          "fight": "Zach Curry def Eduardo Romayor",
          "outcome": "Decision · Unanimous",
          "weight_class": "145"
        },
        "fight_2": {
          "fight": "Keanu Cachora def Larry Carrillo",
          "outcome": "Decision · Unanimous",
          "weight_class": "155"
        },
        "fight_1": {
          "fight": "Jacob Hernandez def Esiel Clark",
          "outcome": "Rear Naked Choke · 1:42 · R2",
          "weight_class": "135"
        }
      }
    }
  ]
}
Get Multiple Regions' Past Events (Bulk Request)
GET /api/schedule/past-events/{regions_id}
Get past events schedule for multiple regions in a single call with enhanced fight card details.

Query Parameters:

regions_id (string, required): Comma-separated region IDs (max 3)
fields (string, optional): Comma-separated list of fields to include in response
page (integer, optional): Page number for pagination (default: 1)
Example Request:

GET /api/schedule/past-events/regions_id=1,5&fields=organization,main_event,datetime,city,subregion&page=1
Example Response:

{
  "events_by_region": {
    "1": [
      {
        "organization": "Samourai MMA 13",
        "main_event": "Weeks vs. Leblanc",
        "datetime": "Friday, March  7,  7:00 PM ET",
        "city": "Gatineau, QC",
        "subregion": "Canada Region"
      }
    ],
    "5": [
      {
        "organization": "Endouro Fight Series 8",
        "main_event": "Eadie vs. Mo",
        "datetime": "Saturday, March 22,  3:30 AM ET",
        "city": "Canberra, AU",
        "subregion": "Australia & New Zealand Region"
      }
    ]
<div> <h3>⚙️ UTILITY ENDPOINTS ⚙️</h3> </div>
<div> <h3> 🚫 ERROR HANDLING 🚫 </h3> </div>
The API uses standard HTTP response codes to indicate the success or failure of requests:

| HTTP Status Code | Description | |------------------|-------------| | 400 | Bad Request: Invalid request parameters | | 401 | Unauthorized: Missing or invalid API key | | 404 | Not Found: Requested resource not found | | 429 | Too Many Requests: Rate limit exceeded | | 500 | Internal Server Error: Server-side error |

<div> <h3>🌍 REGIONS ID 🌍</h3> </div>
The API covers various regions for event schedules. All available region IDs are listed below:

US States:
13: Ohio
14: Florida
15: Utah
16: Nevada
17: California
18: Pennsylvania
21: Kentucky
22: Indiana
23: Tennessee
24: Kansas & Missouri
25: Iowa
26: Colorado
27: Illinois
28: North Carolina
29: New Mexico
35: Oklahoma
37: New York
38: New Jersey
39: Hawaii
45: Georgia
46: Alabama
47: Mississippi
48: Louisiana
49: Minnesota
50: North & South Dakota
52: Alaska
56: Arizona
57: Virginia
58: Wisconsin
59: Montana
61: Delaware
62: Maryland
72: Wyoming
73: Idaho
76: West Virginia
US Regions:
11: Pacific Northwest
60: US Northeast
63: US Midwest
65: US Southeast
68: US Southwest
69: US West
Canada:
1: Québec
4: Canada
42: Ontario
43: Western Canada
44: Maritime Canada
Europe:
3: United Kingdom & Ireland
7: Europe Nordic
9: Germany
19: Poland
74: Europe Western
75: France
77: Italy
78: Spain
79: Netherlands
80: Austria
81: Switzerland
83: Portugal
84: Europe Balkans
85: Greece
86: Europe Eastern
53: Romania
54: Croatia
55: Czech Republic
Asia:
8: Japan
12: Asia Southeast
33: South Korea
34: China
92: Asia Central
93: Asia South
119: Asia Pacific
Australia & Oceania:
5: Australia & New Zealand
Latin America:
6: Brazil
32: Peru
40: Mexico
70: Argentina
71: Latin America
98: Chile
101: Colombia
102: Guatemala
104: Belize
105: El Salvador
106: Nicaragua
107: Costa Rica
108: Panama
Brazil Regions:
95: Minas Gerais
112: Brazil Northeast
113: Brazil North
114: Brazil Central-West
115: Brazil Southeast
116: Brazil South
Middle East:
41: Middle East
88: Bahrain
89: Lebanon
Africa:
36: South Africa
64: Egypt
96: North Africa
Other Subregions or Continents:
67: Caribbean
90: North America
94: Caucasus
117: Europe
118: Eurasia
120: Central & South America
121: Middle East & Africa
<div> <h3> 💳️ PRICING STRUCTURE 💳️ </h3> </div>
| Plan | Price | Rate Limit | Monthly Quota | Use Case | |------|-------|------------|---------------|----------| | BASIC | Free | x requests/min | 53 requests | Testing and evaluation | | PRO | $12.99/month | x requests/min | 3,250 requests | Individual developers, small projects | | MEGA | $(30)39.99/month | x requests/min | 32,000 requests | High-volume applications, businesses |

Features by Plan
We've revised our pricing to include access to new field-level data controls:

This structure allows granular data retrieval with field selection parameters available across all tiers, while bulk operations remain a premium feature.

BASIC: Single region/fighter access only
PRO: Single + bulk access (limited)
MEGA: Full access to all endpoints with highest quotas
<div> <h3>⭐ BEST PRACTICES ⭐</h3> </div>
Use the fields parameter to request only the data you need
Implement caching on your end to store frequently accessed data
Handle rate limiting with exponential backoff in your requests
Respect the source data with proper attribution
<div> <h3> ⏫ CHANGELOG ⏫ </h3> </div>
2025-04-01 (v1.3.0):
New princing structure

Added enhanced bulk endpoints, past events endpoint, and improved error handling

Get Upcoming/Past Events: Maximum of 3 region IDs allowed per request

Get Fighter Result: Maximum of 3 fighter IDs allowed per request

2025-01-03 (v1.2.0):
Performance optimization and latency reduction
2024-11-05 (v1.1.0):
Simplified authentication flow
2024-10-28 (v1.0.1):
First stable release
<div> <h3>🛠️ DEPLOYMENT OPTIONS 🛠️</h3> </div>
The API is designed to be deployed in various environments:

Docker: Containerized deployment with included Dockerfile
Self-hosted: Standard gunicorn/uvicorn setup
<div> <h3> ❓ SUPPORT ❓ </h3> </div>
For any questions or issues, please contact us at unofficial-tapology-api@proton.me

<div> <h3>☑️ TERMS OF USE ☑️</h3> </div>
The data provided by this API is sourced from Tapology.com. We respect the intellectual property rights of Tapology and adhere to fair use principles. All users must comply with fair use guidelines:

Attribution: Always provide clear attribution to Tapology.com as the original source
Limited Use: Use the data for informational purposes only
No Bulk Downloads: Only request the data you need for immediate use
Respect Rate Limits: Adhere to the rate limits specified in your plan
No Misrepresentation: Do not present the data in a misleading way
Freshness: Implement regular updates to ensure current data