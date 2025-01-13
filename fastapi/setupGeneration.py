import os
import json
import logging
from typing import Dict, List
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AssessmentSetup(BaseModel):
    questionType: str
    numberOfQuestions: int
    topic: str
    difficulty: str
    language: str = "English"  # Default to English if not specified

def generate_prompt(setup: AssessmentSetup) -> str:
    language_prompts = {
        "English": "English",
        "Hindi": "Hindi (हिंदी)",
        "Bengali": "Bengali (বাংলা)",
        "Gujarati": "Gujarati (ગુજરાતી)",
        "Kannada": "Kannada (ಕನ್ನಡ)",
        "Malayalam": "Malayalam (മലയാളം)",
        "Marathi": "Marathi (मराठी)",
        "Punjabi": "Punjabi (ਪੰਜਾਬੀ)",
        "Tamil": "Tamil (தமிழ்)",
        "Telugu": "Telugu (తెలుగు)"
    }
    
    selected_language = language_prompts.get(setup.language, "English")
    
    return f"""Generate exactly {setup.numberOfQuestions} {selected_language} speaking assessment questions based on these criteria:
    - Type: {setup.questionType}
    - Topic: {setup.topic}
    - Difficulty: {setup.difficulty}
    - Language: {selected_language}

    Requirements:
    - Questions should be in {selected_language}
    - Each question should be on a new line
    - Questions should be open-ended
    - Encourage detailed responses
    - Match the specified difficulty level
    - Focus on the given topic
    - Include a mix of personal experience and analytical thinking

    Format your response as follows:
    1. [First question in {selected_language}]

    2. [Second question in {selected_language}]

    3. [Third question in {selected_language}]

    Only include the numbered questions, one per line. No additional text or formatting."""

def extract_questions_from_text(text: str, num_questions: int) -> List[str]:
    """Extract questions from text response, handling different formats."""
    # Remove any markdown formatting
    clean_text = text.replace("```", "").strip()
    
    # Split by newlines and clean up
    lines = [line.strip() for line in clean_text.split('\n') if line.strip()]
    
    # Remove numbering and any extra formatting
    questions = []
    for line in lines:
        # Remove common number formats (1., 1), Q1:, etc.)
        cleaned = line.strip()
        if cleaned:
            # Remove numbering patterns
            patterns = [
                r'^\d+[\.\)]\s*',  # Matches "1." or "1)"
                r'^Q\d+[:\.]\s*',  # Matches "Q1:" or "Q1."
                r'^\[\d+\]\s*',    # Matches "[1]"
                r'^Question\s*\d+[:\.]\s*'  # Matches "Question 1:" or "Question 1."
            ]
            for pattern in patterns:
                import re
                cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
            
            cleaned = cleaned.strip()
            if cleaned:
                questions.append(cleaned)
    
    # Ensure we have exactly the number of questions requested
    questions = questions[:num_questions]
    while len(questions) < num_questions:
        questions.append(get_fallback_question(setup.language))
    
    return questions

def generate_questions(setup: AssessmentSetup) -> List[str]:
    client = Groq(
        api_key=os.getenv("Grok_API_KEY"),
    )

    prompt = generate_prompt(setup)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"""You are an expert {setup.language} language assessment creator. 
                    Generate questions that are clear, engaging, and appropriate for the specified level.
                    All questions must be in {setup.language}.
                    Each question should be on a new line and numbered.
                    Do not include any additional text or formatting."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.2-3b-preview",
            temperature=0.7,
            max_tokens=2000,
            top_p=1,
            stream=False
        )
        
        response_content = chat_completion.choices[0].message.content
        
        # Extract questions from the response
        questions = extract_questions_from_text(response_content, setup.numberOfQuestions)
        
        if not questions:
            logger.warning("No questions extracted, using fallback questions")
            return get_fallback_questions(setup.numberOfQuestions, setup.language)
        
        return questions
            
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return get_fallback_questions(setup.numberOfQuestions, setup.language)

def get_fallback_question(language: str = "English") -> str:
    fallback_questions = {
        "English": "Could you describe a challenging situation you've faced and how you handled it?",
        "Hindi": "क्या आप एक चुनौतीपूर्ण स्थिति का वर्णन कर सकते हैं जिसका आपने सामना किया और आपने इसे कैसे संभाला?",
        "Bengali": "আপনি এমন একটি চ্যালেঞ্জিং পরিস্থিতির বর্ণনা করতে পারবেন যার সম্মুখীন হয়েছিলেন এবং কীভাবে তা মোকাবেলা করেছিলেন?",
        "Gujarati": "શું તમે એવી કોઈ પડકારજનક પરિસ્થિતિનું વર્ણન કરી શકશો જેનો તમે સામનો કર્યો હતો અને તેને કેવી રીતે હેન્ડલ કરી હતી?",
        "Kannada": "ನೀವು ಎದುರಿಸಿದ ಸವಾಲಿನ ಪರಿಸ್ಥಿತಿಯನ್ನು ಮತ್ತು ನೀವು ಅದನ್ನು ಹೇಗೆ ನಿಭಾಯಿಸಿದ್ದೀರಿ ಎಂಬುದನ್ನು ವಿವರಿಸಬಹುದೇ?",
        "Malayalam": "നിങ്ങൾ നേരിട്ട ഒരു വെല്ലുവിളി നിറഞ്ഞ സാഹചര്യവും അത് എങ്ങനെ കൈകാര്യം ചെയ്തുവെന്നും വിവരിക്കാമോ?",
        "Marathi": "तुम्ही सामोरे गेलेल्या एखाद्या आव्हानात्मक परिस्थितीचे वर्णन करू शकाल का आणि तुम्ही त्याचे व्यवस्थापन कसे केले?",
        "Punjabi": "ਕੀ ਤੁਸੀਂ ਕਿਸੇ ਚੁਣੌਤੀਪੂਰਨ ਸਥਿਤੀ ਦਾ ਵਰਣਨ ਕਰ ਸਕਦੇ ਹੋ ਜਿਸਦਾ ਤੁਸੀਂ ਸਾਹਮਣਾ ਕੀਤਾ ਅਤੇ ਇਸ ਨਾਲ ਕਿਵੇਂ ਨਜਿੱਠਿਆ?",
        "Tamil": "நீங்கள் எதிர்கொண்ட ஒரு சவாலான சூழ்நிலையை விவரிக்க முடியுமா, அதை எப்படி கையாண்டீர்கள்?",
        "Telugu": "మీరు ఎదుర్కొన్న ఒక సవాలు నిండిన పరిస్థితిని మరియు దానిని మీరు ఎలా నిర్వహించారో వివరించగలరా?"
        }

    return fallback_questions.get(language, fallback_questions["English"])

def get_fallback_questions(count: int, language: str = "English") -> List[str]:

    fallback_questions = {
        "English": [
            "Could you describe your typical daily routine?",
            "What are your future career goals and why?",
            "Tell me about a challenging experience and how you handled it.",
            "What are your thoughts on technology's impact on society?",
            "Describe your ideal vacation destination and explain why you'd choose it."
        ],

        "Hindi": [
            "क्या आप अपनी रोजमर्रा की दिनचर्या का वर्णन कर सकते हैं?",
            "आपके भविष्य के करियर लक्ष्य क्या हैं और क्यों?",
            "मुझे एक चुनौतीपूर्ण अनुभव के बारे में बताएं और आपने इसे कैसे संभाला।",
            "समाज पर प्रौद्योगिकी के प्रभाव पर आपके क्या विचार हैं?",
            "अपने आदर्श छुट्टी के स्थान का वर्णन करें और बताएं कि आप इसे क्यों चुनेंगे।"
        ],
        "Bengali": [
            "আপনার প্রতিদিনের রুটিন সম্পর্কে বলুন?",
            "আপনার ভবিষ্যৎ কর্মজীবনের লক্ষ্য কী এবং কেন?",
            "একটি চ্যালেঞ্জিং অভিজ্ঞতা এবং আপনি কিভাবে তা মোকাবেলা করেছিলেন তা বলুন।",
            "সমাজে প্রযুক্তির প্রভাব সম্পর্কে আপনার মতামত কী?",
            "আপনার আদর্শ ছুটির গন্তব্য বর্ণনা করুন এবং আপনি কেন এটি বেছে নেবেন তা ব্যাখ্যা করুন।"
        ],
        "Gujarati": [
            "તમારી રોજિંદી દિનચર્યા વર્ણવી શકશો?",
            "તમારા ભવિષ્યના કારકિર્દી લક્ષ્યો શું છે અને શા માટે?",
            "એક પડકારજનક અનુભવ વિશે જણાવો અને તમે તેને કેવી રીતે હેન્ડલ કર્યો.",
            "સમાજ પર ટેકનોલોજીની અસર વિશે તમારા વિચારો શું છે?",
            "તમારા આદર્શ વેકેશન સ્થળનું વર્ણન કરો અને તમે તેને શા માટે પસંદ કરશો તે સમજાવો."
        ],

        "Kannada": [
            "ನಿಮ್ಮ ದೈನಂದಿನ ದಿನಚರಿಯನ್ನು ವಿವರಿಸಬಹುದೇ?",
            "ನಿಮ್ಮ ಭವಿಷ್ಯದ ವೃತ್ತಿ ಗುರಿಗಳು ಯಾವುವು ಮತ್ತು ಏಕೆ?",
            "ಒಂದು ಸವಾಲಿನ ಅನುಭವದ ಬಗ್ಗೆ ಹೇಳಿ ಮತ್ತು ನೀವು ಅದನ್ನು ಹೇಗೆ ನಿಭಾಯಿಸಿದಿರಿ.",
            "ಸಮಾಜದ ಮೇಲೆ ತಂತ್ರಜ್ಞಾನದ ಪ್ರಭಾವದ ಬಗ್ಗೆ ನಿಮ್ಮ ಅಭಿಪ್ರಾಯವೇನು?",
            "ನಿಮ್ಮ ಆದರ್ಶ ರಜಾ ತಾಣವನ್ನು ವಿವರಿಸಿ ಮತ್ತು ನೀವು ಏಕೆ ಅದನ್ನು ಆಯ್ಕೆ ಮಾಡುತ್ತೀರಿ ಎಂಬುದನ್ನು ವಿವರಿಸಿ."
        ],
        "Marathi": [
            "तुमच्या नेहमीच्या दिनचर्येचे वर्णन करू शकाल का?",
            "तुमची भविष्यातील करिअर ध्येये काय आहेत आणि का?",
            "एका आव्हानात्मक अनुभवाबद्दल सांगा आणि तुम्ही त्याचे व्यवस्थापन कसे केले.",
            "समाजावर तंत्रज्ञानाच्या प्रभावाबद्दल तुमचे विचार काय आहेत?",
            "तुमच्या आदर्श सुट्टीच्या स्थळाचे वर्णन करा आणि तुम्ही ते का निवडाल ते स्पष्ट करा."
        ],
        "Malayalam": [
            "നിങ്ങളുടെ ദൈനംദിന ജീവിതചര്യ വിവരിക്കാമോ?",
            "നിങ്ങളുടെ ഭാവി കരിയർ ലക്ഷ്യങ്ങൾ എന്തൊക്കെയാണ്, എന്തുകൊണ്ട്?",
            "ഒരു വെല്ലുവിളി നിറഞ്ഞ അനുഭവത്തെക്കുറിച്ചും അത് നിങ്ങൾ എങ്ങനെ കൈകാര്യം ചെയ്തുവെന്നും പറയൂ.",
            "സമൂഹത്തിൽ സാങ്കേതികവിദ്യയുടെ സ്വാധീനത്തെക്കുറിച്ച് നിങ്ങളുടე അഭിപ്രായം എന്താണ്?",
            "നിങ്ങളുടെ ആദർശ അവധിക്കാല സ്ഥലം വിവരിക്കുകയും അത് എന്തുകൊണ്ട് തിരഞ്ഞെടുക്കും എന്ന് വിശദീകരിക്കുകയും ചെയ്യുക."
        ],
        "Punjabi": [
            "ਕੀ ਤੁਸੀਂ ਆਪਣੀ ਰੋਜ਼ਾਨਾ ਦੀ ਦਿਨਚਰਯਾ ਦਾ ਵਰਣਨ ਕਰ ਸਕਦੇ ਹੋ?",
            "ਤੁਹਾਡੇ ਭਵਿੱਖ ਦੇ ਕੈਰੀਅਰ ਟੀਚੇ ਕੀ ਹਨ ਅਤੇ ਕਿਉਂ?",
            "ਇੱਕ ਚੁਣੌਤੀਪੂਰਨ ਤਜਰਬੇ ਬਾਰੇ ਦੱਸੋ ਅਤੇ ਤੁਸੀਂ ਇਸ ਨਾਲ ਕਿਵੇਂ ਨਜਿੱਠਿਆ।",
            "ਸਮਾਜ 'ਤੇ ਤਕਨਾਲੋਜੀ ਦੇ ਪ੍ਰਭਾਵ ਬਾਰੇ ਤੁਹਾਡੇ ਕੀ ਵਿਚਾਰ ਹਨ?",
            "ਆਪਣੀ ਆਦਰਸ਼ ਛੁੱਟੀਆਂ ਦੀ ਮੰਜ਼ਿਲ ਦਾ ਵਰਣਨ ਕਰੋ ਅਤੇ ਦੱਸੋ ਕਿ ਤੁਸੀਂ ਇਸਨੂੰ ਕਿਉਂ ਚੁਣੋਗੇ।"
        ],

        "Tamil": [
            "உங்கள் வழக்கமான தினசரி வாழ்க்கையை விவரிக்க முடியுமா?",
            "உங்கள் எதிர்கால தொழில் இலக்குகள் என்ன, ஏன்?",
            "ஒரு சவாலான அனுபவத்தைப் பற்றியும் நீங்கள் அதை எவ்வாறு கையாண்டீர்கள் என்பதைப் பற்றியும் கூறுங்கள்.",
            "சமூகத்தில் தொழில்நுட்பத்தின் தாக்கம் பற்றி உங்கள் கருத்து என்ன?",
            "உங்கள் கனவு விடுமுறை இடத்தை விவரித்து, நீங்கள் ஏன் அதைத் தேர்வு செய்வீர்கள் என்பதை விளக்குங்கள்."
        ],
        "Telugu": [
            "మీ రోజువారీ దినచర్యను వివరించగలరా?",
            "మీ భవిష్యత్ వృత్తి లక్ష్యాలు ఏమిటి మరియు ఎందుకు?",
            "ఒక సవాలు నిండిన అనుభవం గురించి చెప్పండి మరియు మీరు దానిని ఎలా ఎదుర్కొన్నారు.",
            "సమాజంపై సాంకేతిక పరిజ్ఞానం ప్రభావం గురించి మీ ఆలోచనలు ఏమిటి?",
            "మీ ఆదర్శ సెలవు గమ్యస్థానాన్ని వివరించి, మీరు దానిని ఎందుకు ఎంచుకుంటారో వివరించండి."
        ],
    }
    
    selected_questions = fallback_questions.get(language, fallback_questions["English"])
    return selected_questions[:count]

async def generate_assessment_questions(setup: Dict) -> List[str]:
    """
    Main function to generate assessment questions based on setup parameters.
    """
    assessment_setup = AssessmentSetup(**setup)
    questions = generate_questions(assessment_setup)
    
    return questions