"""
University API Lambda Handler

Drop-in replacement for the DynamoDB-backed Lambda. Reads from an SQLite database
stored on S3, caches it in /tmp for warm invocations, and returns the exact same
response shape as the original service.

Environment variables:
    DB_BUCKET  - S3 bucket name (e.g. university-scraper-data-440047266716)
    DB_KEY     - S3 object key (default: university_scraper.db)
"""

import json
import os
import sqlite3
import time

import boto3

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DB_BUCKET = os.environ.get("DB_BUCKET", "")
DB_KEY = os.environ.get("DB_KEY", "university_scraper.db")
DB_PATH = "/tmp/university_scraper.db"
CACHE_TTL = 300  # seconds (5 min)

_db_conn = None
_db_load_time = 0

# ---------------------------------------------------------------------------
# Supported sports & divisions -- identical to the original Lambda
# ---------------------------------------------------------------------------

SUPPORTED_SPORTS = [
    "Football",
    "Softball",
    "Baseball",
    "MensSoccer",
    "WomensSoccer",
    "MensBasketball",
    "WomensBasketball",
    "MensIceHockey",
    "WomensIceHockey",
    "MensTrack",
    "WomensTrack",
    "MensVolleyball",
    "WomensVolleyball",
    "WomensTennis",
    "MensTennis",
    "MensSwimming",
    "WomensSwimming",
    "WomensFlagFootball",
    "MensLacrosse",
    "WomensLacrosse",
    "WomensCrossCountry",
    "MensCrossCountry",
    "MensGolf",
    "WomensGolf",
    "Cheerleading",
    "Dance",
]

SUPPORTED_DIVISIONS = [
    "division-1",
    "division-1aa",
    "division-2",
    "division-3",
    "division-juco",
    "division-naia",
]

# ---------------------------------------------------------------------------
# Field maps: SQLite column -> downstream PascalCase key
# Typos (ReligiosAffiliate, USNewsRankingLibralArts) are INTENTIONAL --
# they match the existing production contract.
# ---------------------------------------------------------------------------

SCHOOL_FIELD_MAP = {
    "conference": "Conference",
    "school": "School",
    "landing_page": "LandingPage",
    "school_twitter": "SchoolTwitter",
    "team_facebook": "TeamFacebook",
    "school_instagram": "SchoolInstagram",
    "questionnaire": "Questionnaire",
    "state": "State",
    "city": "City",
    "region": "Region",
    "size_of_city": "SizeOfCity",
    "private_public": "PrivatePublic",
    "religious_affiliate": "ReligiosAffiliate",
    "hbcu_or_comm_or_womens_only": "HBCUorCommOrWomensOnly",
    "average_gpa": "AverageGPA",
    "sat_reading": "SATReading",
    "sat_math": "SATMath",
    "act_composite": "ACTComposite",
    "acceptance_rate": "AcceptanceRate",
    "yearly_cost": "YearlyCost",
    "majors_offered_link": "MajorsOfferedLink",
    "number_of_grads": "NumberOfGrads",
    "us_news_ranking": "USNewsRanking",
    "us_news_ranking_liberal_arts": "USNewsRankingLibralArts",
    "ipeds_nces_id": "IPEDSNCESID",
    "logo_url": "LogoURL",
}

COACH_FIELD_MAP = {
    "first_name": "FirstName",
    "last_name": "LastName",
    "position": "Position",
    "email": "Email",
    "phone_number": "PhoneNumber",
    "coach_twitter": "CoachTwitter",
    "coach_instagram": "CoachInstagram",
    "coach_facebook": "CoachFacebook",
}

# Columns needed from each table (used in SELECT)
_SCHOOL_COLS = list(SCHOOL_FIELD_MAP.keys())
_COACH_COLS = list(COACH_FIELD_MAP.keys())

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
}

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------


def _get_db():
    """Return a cached SQLite connection, refreshing from S3 when stale."""
    global _db_conn, _db_load_time

    now = time.time()
    if _db_conn is not None and (now - _db_load_time) < CACHE_TTL:
        return _db_conn

    # Close previous connection if any
    if _db_conn is not None:
        try:
            _db_conn.close()
        except Exception:
            pass

    s3 = boto3.client("s3", region_name="us-west-2")
    s3.download_file(DB_BUCKET, DB_KEY, DB_PATH)

    _db_conn = sqlite3.connect(DB_PATH)
    _db_conn.row_factory = sqlite3.Row
    _db_load_time = now
    return _db_conn


def _row_to_dict(row, field_map):
    """Convert a sqlite3.Row to a dict using field_map, omitting empty values."""
    out = {}
    for db_col, api_key in field_map.items():
        val = row[db_col]
        if val is not None and val != "":
            out[api_key] = val
    return out


# ---------------------------------------------------------------------------
# Parameter validation & normalization
# ---------------------------------------------------------------------------


def _normalize_params(params):
    """Validate and normalize query parameters. Returns (sport, division, state, school)."""
    if not params:
        raise ValueError("Sport and division are required parameters")

    sport = (params.get("sport") or "").strip()
    division = (params.get("division") or "").strip().lower()
    state = (params.get("state") or "").strip().upper() or None
    school = (params.get("school") or "").strip() or None

    if not sport or not division:
        raise ValueError("Sport and division are required parameters")

    if sport not in SUPPORTED_SPORTS:
        raise ValueError(
            f"Unsupported sport: {sport}. Supported sports are: {', '.join(SUPPORTED_SPORTS)}"
        )

    if division not in SUPPORTED_DIVISIONS:
        raise ValueError(
            f"Unsupported division: {division}. Supported divisions are: {', '.join(SUPPORTED_DIVISIONS)}"
        )

    return sport, division, state, school


def _sport_filter(sport):
    """Map the API sport parameter to SQLite sport column value(s).

    Cheerleading and Dance are separate in the DB but were combined into
    a single DynamoDB table (WomensCheerleadingDance) in the old system.
    We return both so the response matches the combined behavior.
    """
    if sport in ("Cheerleading", "Dance"):
        return ["Cheerleading", "Dance"]
    return [sport]


# ---------------------------------------------------------------------------
# Query builders
# ---------------------------------------------------------------------------


def _query_school_list(db, sports, division, state):
    """Mode A: return unique schools (no school param)."""

    placeholders = ",".join(["?"] * len(sports))
    sql = (
        f"SELECT DISTINCT {', '.join('u.' + c for c in _SCHOOL_COLS)} "
        f"FROM universities u "
        f"WHERE u.sport IN ({placeholders}) AND u.division = ?"
    )
    params = list(sports) + [division]

    if state:
        sql += " AND u.state2 = ?"
        params.append(state)

    sql += " ORDER BY u.school"

    cur = db.execute(sql, params)
    rows = cur.fetchall()

    # Deduplicate by school name (a school may appear for multiple sports
    # when Cheerleading + Dance are combined)
    seen = {}
    for row in rows:
        name = row["school"]
        if name not in seen:
            seen[name] = _row_to_dict(row, SCHOOL_FIELD_MAP)

    return list(seen.values())


def _query_school_detail(db, sports, division, state, school):
    """Mode B: return {schoolInfo, coaches} groups for matching schools."""

    sport_ph = ",".join(["?"] * len(sports))
    school_cols = ", ".join(f"u.{c}" for c in _SCHOOL_COLS)
    coach_cols = ", ".join(f"c.{c}" for c in _COACH_COLS)

    sql = (
        f"SELECT {school_cols}, {coach_cols} "
        f"FROM universities u "
        f"LEFT JOIN coaches c ON c.university_id = u.id "
        f"WHERE u.sport IN ({sport_ph}) AND u.division = ? "
        f"AND u.school LIKE ?"
    )
    params = list(sports) + [division, f"%{school}%"]

    if state:
        sql += " AND u.state2 = ?"
        params.append(state)

    sql += " ORDER BY u.school, c.last_name, c.first_name"

    cur = db.execute(sql, params)
    rows = cur.fetchall()

    # Group by school name
    groups = {}
    for row in rows:
        name = row["school"]
        if name not in groups:
            groups[name] = {
                "schoolInfo": _row_to_dict(row, SCHOOL_FIELD_MAP),
                "coaches": [],
            }
        coach = _row_to_dict(row, COACH_FIELD_MAP)
        if coach:  # skip empty coach dicts (LEFT JOIN with no coaches)
            groups[name]["coaches"].append(coach)

    return list(groups.values())


# ---------------------------------------------------------------------------
# Lambda entry point
# ---------------------------------------------------------------------------


def lambda_handler(event, context):
    """AWS Lambda handler -- Function URL compatible."""
    try:
        params = event.get("queryStringParameters") or {}
        sport, division, state, school = _normalize_params(params)

        db = _get_db()
        sports = _sport_filter(sport)

        if school:
            data = _query_school_detail(db, sports, division, state, school)
        else:
            data = _query_school_list(db, sports, division, state)

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(data),
        }

    except ValueError as exc:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(exc)}),
        }
    except Exception as exc:
        print(f"Error: {exc}")
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(exc)}),
        }
