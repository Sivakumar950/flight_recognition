import json
import uuid
import base64
import boto3
from datetime import datetime, timezone

# ─── AWS Clients ───
bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")  # Change to your region
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("AircraftPredictions")

# ─── Config ───
# Amazon Nova Lite — multimodal (text + image), available by default in Bedrock
# No model access request needed.
BEDROCK_MODEL_ID = "amazon.nova-lite-v1:0"

# ─── CORS Headers ───
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def lambda_handler(event, context):
    """
    AWS Lambda handler for FlightRec aircraft recognition.

    Flow:
      1. Receives base64 image from API Gateway
      2. Sends image to Amazon Bedrock (Nova Lite) for identification
      3. Stores result metadata in DynamoDB
      4. Returns aircraft_type, airline, confidence to frontend
    """

    # Handle CORS preflight
    http_method = event.get("httpMethod", "")
    if http_method == "OPTIONS":
        return _response(200, {})

    try:
        # 1. Parse request body
        body = json.loads(event.get("body", "{}"))
        base64_image = body.get("image", "")

        if not base64_image:
            return _response(400, {"error": "Missing 'image' field in request body"})

        print(f"Image received, size: {len(base64_image)} chars")

        # 2. Call Amazon Bedrock for aircraft identification
        prediction = call_bedrock(base64_image)

        aircraft_type = prediction.get("aircraft_type", "Unknown")
        airline = prediction.get("airline", "Unknown")
        confidence = prediction.get("confidence", "0")

        # 3. Store result in DynamoDB
        prediction_id = str(uuid.uuid4())
        store_prediction(prediction_id, aircraft_type, airline, confidence)
        print(f"Prediction stored: {prediction_id}")

        # 4. Return result
        return _response(200, {
            "aircraft_type": aircraft_type,
            "airline": airline,
            "confidence": confidence,
        })

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return _response(500, {"error": f"Internal server error: {str(e)}"})


def call_bedrock(base64_image: str) -> dict:
    """Calls Amazon Bedrock Nova Lite using the Converse API with the aircraft image."""
    try:
        # Decode the base64 image into bytes for the Converse API
        image_bytes = base64.b64decode(base64_image)

        # Use the Converse API (recommended for Amazon Nova models)
        response = bedrock.converse(
            modelId=BEDROCK_MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": "jpeg",
                                "source": {
                                    "bytes": image_bytes
                                }
                            }
                        },
                        {
                            "text": (
                                "Analyze this aircraft image. Identify the aircraft and respond "
                                "ONLY with a JSON object (no markdown, no explanation, no extra text) "
                                "in this exact format:\n"
                                '{"aircraft_type": "<model name>", "airline": "<airline name or Unknown>", '
                                '"confidence": "<number 0-100>"}\n'
                                "If you cannot identify the aircraft, still respond with the JSON "
                                "format using your best guess."
                            )
                        }
                    ]
                }
            ],
            inferenceConfig={
                "maxTokens": 256,
                "temperature": 0.1,
                "topP": 0.9,
            }
        )

        # Parse the Converse API response
        output_message = response["output"]["message"]
        generated_text = output_message["content"][0]["text"].strip()
        print(f"Bedrock response: {generated_text}")

        # Extract JSON from the response
        start = generated_text.find("{")
        end = generated_text.rfind("}") + 1
        if start != -1 and end > start:
            json_str = generated_text[start:end]
            return json.loads(json_str)

        raise ValueError("No valid JSON in Bedrock response")

    except Exception as e:
        print(f"Bedrock call failed: {str(e)}")
        print("Returning mock response for testing")

        # ============================================
        # MOCK RESPONSE — Remove this block once
        # Bedrock is properly configured and tested.
        # ============================================
        return {
            "aircraft_type": "Boeing 737-800",
            "airline": "Southwest Airlines",
            "confidence": "85",
        }


def store_prediction(prediction_id: str, aircraft_type: str, airline: str, confidence: str):
    """Stores prediction metadata in DynamoDB."""
    table.put_item(
        Item={
            "id": prediction_id,
            "aircraft_type": aircraft_type,
            "airline": airline,
            "confidence": confidence,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


def _response(status_code: int, body: dict) -> dict:
    """Helper to create API Gateway proxy response."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }
