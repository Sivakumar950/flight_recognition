# Integration Steps — FlightRec

Step-by-step guide for connecting all components end-to-end.

---

## 1. Frontend → API Gateway

**How it works:** The React app sends a POST request with the base64-encoded image to API Gateway.

### Setup:
1. Deploy API Gateway (see `aws-setup/api_gateway_setup.txt`)
2. Copy the Invoke URL, e.g.:
   ```
   https://abc123.execute-api.us-east-1.amazonaws.com/prod
   ```
3. Update `frontend/src/App.jsx`:
   ```js
   // Change this line:
   const API_URL = '/predict'
   
   // To your API Gateway URL:
   const API_URL = 'https://abc123.execute-api.us-east-1.amazonaws.com/prod/predict'
   ```
4. Rebuild and redeploy the frontend

### Request Flow:
```
User clicks "Analyze Aircraft"
  → Image converted to base64
  → POST request to API_URL
  → Body: { "image": "base64string..." }
  → Content-Type: application/json
```

---

## 2. API Gateway → Lambda

**How it works:** API Gateway uses Lambda Proxy Integration to forward the full request to Lambda.

### What happens:
- API Gateway receives POST `/predict`
- Passes the entire request (headers, body, method) to Lambda
- Lambda receives the event as a Python dictionary
- Lambda returns `{ statusCode, headers, body }` dictionary
- API Gateway forwards the response to the client

### CORS Flow:
- Browser sends OPTIONS preflight request first
- Lambda handles OPTIONS and returns CORS headers
- Browser then sends the actual POST request
- Lambda includes CORS headers in POST response too

### Key Configuration:
- Integration type: **Lambda Proxy**
- Method: **POST**
- Resource: **/predict**
- CORS headers set in both API Gateway AND Lambda code

---

## 3. Lambda → Bedrock

**How it works:** Lambda sends the base64 image to Claude 3 Sonnet via the Bedrock Runtime API using boto3.

### Request Format (Claude 3 Messages API):
```json
{
  "anthropic_version": "bedrock-2023-05-31",
  "max_tokens": 256,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": "<base64-image-data>"
          }
        },
        {
          "type": "text",
          "text": "Analyze this aircraft image..."
        }
      ]
    }
  ]
}
```

### Response Parsing:
- Bedrock returns Claude's response in `content[0].text`
- Lambda extracts the JSON string from that text
- Parses it into: `{ aircraft_type, airline, confidence }`

### Fallback:
- If Bedrock fails, Lambda returns a **mock response**
- Remove the mock once Bedrock is configured and tested

---

## 4. Lambda → DynamoDB

**How it works:** After getting the prediction, Lambda stores metadata in DynamoDB using boto3.

### What gets stored:
| Field         | Value                    |
|---------------|--------------------------|
| id            | Random UUID              |
| aircraft_type | From Bedrock response    |
| airline       | From Bedrock response    |
| confidence    | From Bedrock response    |
| timestamp     | ISO 8601 timestamp       |

### Notes:
- No image data is stored (only metadata)
- Table: `AircraftPredictions`
- Partition key: `id` (String)
- Uses `put_item` operation

---

## 5. End-to-End Deployment Order

Follow this exact order:

```
1. Create DynamoDB table         → aws-setup/dynamodb_setup.txt
2. Enable Bedrock model access   → aws-setup/bedrock_setup.txt
3. Package & deploy Lambda       → aws-setup/lambda_setup.txt
4. Create API Gateway            → aws-setup/api_gateway_setup.txt
5. Update frontend API URL       → Update App.jsx
6. Deploy frontend to Amplify    → aws-setup/amplify_setup.txt
```

---

## 6. Testing Checklist

- [ ] DynamoDB table `AircraftPredictions` exists and is Active
- [ ] Bedrock Claude 3 Sonnet access is granted
- [ ] Lambda test event returns a valid JSON response
- [ ] API Gateway POST /predict returns 200 with JSON
- [ ] Frontend loads at Amplify URL
- [ ] Uploading an image shows prediction results
- [ ] DynamoDB has new records after predictions
