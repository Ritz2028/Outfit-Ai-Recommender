from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
import shutil
import json
import traceback

# Load environment variables
load_dotenv()

# Debug API key loading
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

print("========== GEMINI DEBUG ==========")
print("API KEY LOADED:", GEMINI_API_KEY)
print("==================================")

# Validate API key
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

# FastAPI app
app = FastAPI(title="Outfit AI System")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Response model
class AnalysisResult(BaseModel):
    analysis: dict


@app.get("/")
def root():
    return {"message": "Outfit AI API is running!"}


@app.post("/api/analyze")
async def analyze_outfit(
    file: UploadFile = File(...),
    occasion: str = Form(default="casual outing"),
    preferences: str = Form(default="")
):
    try:

        # Save uploaded file
        file_location = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"Image saved at: {file_location}")

        # Upload file to Gemini
        uploaded_file = genai.upload_file(
            path=file_location,
            display_name=file.filename
        )

        print("Image uploaded to Gemini successfully")

        # Prompt
        prompt = f"""
        You are an elite AI fashion stylist.

        Analyze this outfit image and provide recommendations for:
        {occasion}

        User preferences:
        {preferences}

        Return ONLY valid JSON.

        {{
            "detected_features": {{
                "dominant_colors": ["color1", "color2"],
                "aesthetic": "style name",
                "vibe": "3-word vibe"
            }},
            "recommendation": {{
                "suggested_outfit_pieces": [
                    {{
                        "piece": "item",
                        "reason": "why it works",
                        "color": "recommended color"
                    }}
                ],
                "accessories": ["item1", "item2"],
                "footwear": "shoe suggestion",
                "styling_tip": "professional styling advice"
            }}
        }}
        """

        # Generate AI response
        response = model.generate_content(
            [uploaded_file, prompt]
        )

        response_text = response.text.strip()

        print("RAW GEMINI RESPONSE:")
        print(response_text)

        # Remove markdown wrappers if present
        response_text = response_text.replace("```json", "")
        response_text = response_text.replace("```", "")
        response_text = response_text.strip()

        # Parse JSON
        try:
            parsed_json = json.loads(response_text)

            return {
                "status": "success",
                "data": parsed_json
            }

        except json.JSONDecodeError:
            return {
                "status": "partial_success",
                "message": "AI returned non-perfect JSON",
                "raw_response": response_text
            }

    except Exception as e:
        print("========== ERROR ==========")
        traceback.print_exc()
        print("===========================")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
