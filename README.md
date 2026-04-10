# ✈️ FlightRec — Aircraft Recognition AI

AI-powered aircraft identification using Amazon Bedrock. Upload an aircraft image and get instant identification with type, airline, and confidence score.

## Architecture

```
HTML/CSS/JS  →  API Gateway  →  Lambda (Python)  →  Bedrock (Llama 3.2 Vision)
                                       ↓
                                   DynamoDB
```

## Project Structure

```
flightRec/
├── frontend/                  # Static HTML/CSS/JS (no build tools)
│   ├── index.html             # Main page
│   ├── style.css              # Styling
│   ├── app.js                 # Application logic
│   ├── config.js              # ⚠ API URL (git-ignored)
│   └── config.example.js      # Template for config.js
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
└── .gitignore
```

## Quick Start — Frontend

No build tools needed. Just open the file directly or use any static server:

```bash
# Option 1: Open directly in browser
start frontend/index.html

# Option 2: Use Python's built-in server
cd frontend
python -m http.server 8000
# Then open http://localhost:8000

# Option 3: Use VS Code Live Server extension
```

> **Note:** Update `frontend/config.js` with your API Gateway URL.
> Copy `config.example.js` → `config.js` and fill in the values.

## Quick Start — Lambda (Deploy)

```bash
cd lambda

# Windows PowerShell:
Compress-Archive -Path lambda_function.py -DestinationPath lambda_function.zip

# Mac/Linux:
zip lambda_function.zip lambda_function.py
```

Upload `lambda_function.zip` to AWS Lambda (Python 3.12 runtime).

> **No external dependencies** — only uses `boto3` (pre-installed in Lambda).

## API Security

The API URL is stored in `frontend/config.js` which is **git-ignored**.
A template `config.example.js` is committed so collaborators know the format.

## Deployment Order

1. Create DynamoDB table → `aws-setup/dynamodb_setup.txt`
2. Enable Bedrock access → `aws-setup/bedrock_setup.txt`
3. Deploy Lambda → `aws-setup/lambda_setup.txt`
4. Create API Gateway → `aws-setup/api_gateway_setup.txt`
5. Update `frontend/config.js` with API URL
6. Deploy to Amplify → `aws-setup/amplify_setup.txt`

See [INTEGRATION.md](INTEGRATION.md) for detailed wiring instructions.

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | HTML, CSS, Vanilla JavaScript             |
| API       | Amazon API Gateway (REST)                 |
| Backend   | AWS Lambda (Python 3.12)                  |
| AI        | Amazon Bedrock (Meta Llama 3.2 90B Vision)|
| Database  | Amazon DynamoDB                           |
| Hosting   | AWS Amplify                               |

## License

MIT
