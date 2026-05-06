import requests
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMTRjNjlhZC0zMDMzLTQ2NGYtYWNjNy0wZDAyYjgyZTlkMjMiLCJlbWFpbCI6InphbGx1NDQzNUBnbWFpbC5jb20iLCJyb2xlIjoiZGV2ZWxvcGVyIiwiaWF0IjoxNzc3OTk4NTk1LCJleHAiOjE3NzgwODQ5OTV9.4LWiVxJXia8WQ_MZP6JQHRqpFTaSM_ChTSwaqY29NZU"
res = requests.get("http://localhost:8000/insights", headers={"Authorization": f"Bearer {token}"})
print(res.json())
