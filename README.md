# FlightRec

Aircraft recognition app powered by Amazon Bedrock. Upload a photo of any aircraft and get back the type, airline, and a confidence score.

## Architecture

```
HTML/CSS/JS  ->  API Gateway  ->  Lambda (Python)  ->  Bedrock (Amazon Nova Lite)
                                        |
                                    DynamoDB
```

## Project Structure

```
flightRec/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── config.js              # git-ignored, contains your API URL
│   └── config.example.js      # template for config.js
├── lambda/
│   └── lambda_function.py
├── aws-setup/
│   ├── amplify_setup.txt
│   ├── api_gateway_setup.txt
│   ├── lambda_setup.txt
│   ├── dynamodb_setup.txt
│   └── bedrock_setup.txt
├── INTEGRATION.md
└── README.md
```

## Running Locally

No build tools needed. Serve the frontend folder with any static server:

```bash
cd frontend
python -m http.server 8000
```

Copy `config.example.js` to `config.js` and set your API Gateway URL before opening the app.

## Deploying the Lambda

```bash
cd lambda

# Windows
Compress-Archive -Path lambda_function.py -DestinationPath lambda_function.zip

# Mac/Linux
zip lambda_function.zip lambda_function.py
```

Upload the zip to AWS Lambda with Python 3.12 runtime. No additional dependencies required — only `boto3`, which is pre-installed.

## Deployment Order

1. Create DynamoDB table — see `aws-setup/dynamodb_setup.txt`
2. Enable Bedrock model access — see `aws-setup/bedrock_setup.txt`
3. Deploy Lambda — see `aws-setup/lambda_setup.txt`
4. Create API Gateway — see `aws-setup/api_gateway_setup.txt`
5. Set the API URL in `frontend/config.js`
6. Deploy frontend to Amplify — see `aws-setup/amplify_setup.txt`

See [INTEGRATION.md](INTEGRATION.md) for the full wiring guide.

## Tech Stack

| Layer    | Technology                       |
|----------|----------------------------------|
| Frontend | HTML, CSS, Vanilla JS            |
| API      | Amazon API Gateway               |
| Backend  | AWS Lambda (Python 3.12)         |
| AI       | Amazon Bedrock (Nova Lite)       |
| Database | Amazon DynamoDB                  |
| Hosting  | AWS Amplify                      |

## License

MIT
