# ✈️ FlightRec — Aircraft Recognition AI

AI-powered aircraft identification using Amazon Bedrock. Upload an aircraft image and get instant identification with type, airline, and confidence score.

## Architecture

```
React (Vite)  →  API Gateway  →  Lambda (Python)  →  Bedrock (Claude 3)
                                       ↓
                                   DynamoDB
```

## Project Structure

```
flightRec/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── App.css            # Styling
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── lambda/                     # AWS Lambda (Python)
│   └── lambda_function.py     # Handler + Bedrock + DynamoDB
├── aws-setup/                  # AWS setup guides
│   ├── amplify_setup.txt
│   ├── api_gateway_setup.txt
│   ├── lambda_setup.txt
│   ├── dynamodb_setup.txt
│   └── bedrock_setup.txt
├── INTEGRATION.md              # End-to-end wiring guide
├── README.md
└── requirements.txt
```

## Quick Start — Frontend (Local Dev)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

> **Note:** The API will return errors until you deploy the backend.
> Update `API_URL` in `src/App.jsx` with your API Gateway URL.

## Quick Start — Lambda (Deploy)

```bash
cd lambda
# Windows:
Compress-Archive -Path lambda_function.py -DestinationPath lambda_function.zip

# Mac/Linux:
zip lambda_function.zip lambda_function.py
```

Upload `lambda_function.zip` to AWS Lambda (Python 3.12 runtime).

> **No external dependencies needed** — the function only uses `boto3` which is pre-installed in the Lambda runtime.

## Deployment Order

1. Create DynamoDB table → `aws-setup/dynamodb_setup.txt`
2. Enable Bedrock access → `aws-setup/bedrock_setup.txt`
3. Deploy Lambda → `aws-setup/lambda_setup.txt`
4. Create API Gateway → `aws-setup/api_gateway_setup.txt`
5. Update frontend API URL
6. Deploy to Amplify → `aws-setup/amplify_setup.txt`

See [INTEGRATION.md](INTEGRATION.md) for detailed wiring instructions.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite 5                    |
| API       | Amazon API Gateway (REST)           |
| Backend   | AWS Lambda (Python 3.12)            |
| AI        | Amazon Bedrock (Claude 3 Sonnet)    |
| Database  | Amazon DynamoDB                     |
| Hosting   | AWS Amplify                         |

## License

MIT
