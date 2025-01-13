import os
from groq import Groq
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the Groq client with API key from environment variable
client = Groq(api_key=os.getenv("Grok_API_KEY"))

# Language mapping for Whisper model
LANGUAGE_CODES = {
    "Hindi": "hi",
    "Bengali": "bn",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Marathi": "mr",
    "Punjabi": "pa",
    "Tamil": "ta",
    "Telugu": "te",
    "English": "en",
    "Assamese": "as",
    "Odia": "or"
}

PROMPTS = {
    "English": "Dont correct grammatical mistakes and make grammatical mistakes as much as possible and Strictly use hesitation markers like 'hmm', 'um', 'uh', 'aaa', 'aa', 'mmm', 'mm', 'ah', 'er', 'erm', 'uhm', 'uhmm', 'uhhuh', 'uhuh'  as much as possible",

    "Hindi": "वाक्यों को सही न करें और हिचकिचाहट के संकेत जैसे 'हम्म', 'उम्', 'उह', 'आआ', 'आ', 'मम्म', 'मम', 'आह', 'एर', 'एर्म', 'उहम', 'उहमम', 'उहुँ', 'उहुह' शामिल करें।",

    "Bengali": "বাক্য ঠিক করবেন না এবং 'হুম', 'উম', 'উহ', 'আআ', 'আ', 'ম্ম', 'ম', 'আহ', 'এর', 'এর্ম', 'উহম', 'উহমম', 'উহুহ', 'উহু' এর মতো দ্বিধার সূচক অন্তর্ভুক্ত করুন।",

    "Gujarati": "વાક્યોને ઠીક કરશો નહીં અને 'હમ્મ', 'ઉમ', 'ઉહ', 'આઆ', 'આ', 'મ્મ', 'મ', 'આહ', 'એર', 'એર્મ', 'ઉહમ', 'ઉહમમ', 'ઉહુહ', 'ઉહુ' જેવા સંકોચના ચિહ્નો ઉમેરો।",

    "Kannada": "ವಾಕ್ಯಗಳನ್ನು ಸರಿಪಡಿಸಬೇಡಿ ಮತ್ತು 'ಹುಮ್', 'ಉಮ್', 'ಉಹ್', 'ಆಆ', 'ಆ', 'ಮ್ಮೆ', 'ಮ್', 'ಆಹ್', 'ಎರ್', 'ಎರ್ಮ್', 'ಉಹಮ್', 'ಉಹ್ಮ್ಮ್', 'ಉಹುಹ್', 'ಉಹು' ಎಂಬ ತಡಕಿದ ಸೂಚನೆಗಳನ್ನು ಸೇರಿಸಿ.",

    "Malayalam": "വാക്യങ്ങൾ ശരിയാക്കരുത്, 'ഹം', 'ഉം', 'ഉഹ്', 'ആആ', 'ആ', 'മ്മ്', 'മ്', 'ആഹ്', 'എർ', 'എർം', 'ഉഹ്‌ം', 'ഉഹ്മ്മ്', 'ഉഹുഹ്', 'ഉഹു' പോലുള്ള മടിച്ച ചിഹ്നങ്ങൾ ഉൾപ്പെടുത്തുക.",

    "Marathi": "वाक्ये सुधारू नका आणि 'हम्म', 'उम्', 'उह', 'आआ', 'आ', 'म्म', 'म', 'आह', 'एर', 'एर्म', 'उहम', 'उहम्म', 'उहुँ', 'उहु' असे संकोचाचे चिन्ह समाविष्ट करा.",

    "Punjabi": "ਵਾਕਿਆਂ ਨੂੰ ਠੀਕ ਨਾ ਕਰੋ ਅਤੇ 'ਹਮਮ', 'ਉਮ', 'ਉਹ', 'ਆਆ', 'ਆ', 'ਮਮਮ', 'ਮਮ', 'ਆਹ', 'ਏਰ', 'ਏਰਮ', 'ਉਹਮ', 'ਉਹਮਮ', 'ਉਹੁਹ', 'ਉਹੁ' ਵਰਗੇ ਝਿਜਕ ਦੇ ਚਿੰਨ੍ਹ ਸ਼ਾਮਲ ਕਰੋ।",

    "Tamil": "வாக்கியங்களைச் சரிசெய்ய வேண்டாம் மற்றும் 'ஹும்', 'உம்', 'உஹ்', 'ஆஆ', 'ஆ', 'ம்', 'ம', 'ஆஹ்', 'ஏர்', 'ஏர்ம்', 'உஹம்', 'உஹ்ம்ம்', 'உஹுஹ்', 'உஹு' போன்ற தயக்கச் சின்னங்களைச் சேர்க்கவும்.",

    "Telugu": "వాక్యాలను సరిచేయకండి మరియు 'హమ్', 'ఉమ్', 'ఉహ్', 'ఆఆ', 'ఆ', 'మ్మ్', 'మ్', 'ఆహ్', 'ఎర్', 'ఎర్మ్', 'ఉహమ్', 'ఉహ్మ్మ్', 'ఉహుహ్', 'ఉహు' వంటి సందిగ్ధత సూచనలను చేర్చండి.",

    "Assamese": "বাক্যবোৰ সলনি নকৰিব আৰু 'হুম', 'উম', 'উহ', 'আআ', 'আ', 'ম্ম', 'ম', 'আহ', 'এৰ', 'এৰ্ম', 'উহম', 'উহম্ম', 'উহুহ', 'উহু' যেনে সন্দেহ সূচকবোৰ সন্নিৱিষ্ট কৰক।",

}

async def process_audio_file(file_path: str, language: str = "English") -> dict:
    """
    Process an audio file and return its transcription and fluency analysis.
    
    Args:
        file_path (str): Path to the audio file
        language (str): Language name (default: "English")
    
    Returns:
        dict: Dictionary containing transcription result, fluency analysis, and status
    """
    try:
        # Ensure file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return {"status": "error", "message": "File not found"}

        # Get the language code
        language_code = LANGUAGE_CODES.get(language, "en")
        logger.info(f"Processing audio in {language} (code: {language_code})")

        # Open and process the audio file
        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(file_path), file.read()),
                model="whisper-large-v3",
                prompt=PROMPTS.get(language) ,
                response_format="json",
                language=language_code,
                temperature=0
            )

        return {
            "status": "success",
            "text": transcription.text,
            "filename": os.path.basename(file_path),
            "language": language,
            "language_code": language_code
        }

    except Exception as e:
        logger.error(f"Error processing audio file: {str(e)}")
        return {
            "status": "error",
            "message": f"Error processing audio: {str(e)}",
            "filename": os.path.basename(file_path),
            "language": language
        }