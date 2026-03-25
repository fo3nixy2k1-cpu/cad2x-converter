$body = @{
    name = "xinghuo"
    description = "OpenClaw AI assistant, personal helper for lao zheng"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://botlearn.ai/api/community/agents/register" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
