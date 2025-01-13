from typing import Dict, Tuple
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("Grok_API_KEY"),
)

def analyze_response(question: str, answer: str) -> Tuple[float, str]:
    # Count words in the answer
    # word_count = len(answer.split())
    
    # Initialize base score
    score = 0.0
    detailed_feedback = {}
    
    # Check word count requirement (80 words minimum)
    # if word_count < 80:
    #     word_count_score = (word_count / 80) * 50  # Up to 50% of score for word count
    #     detailed_feedback.append(f"Word count ({word_count}/80): Your response is too short. -50% score penalty")
    # else:
    #     word_count_score = 50
    #     detailed_feedback.append(f"Word count ({word_count}/80): Requirement met. Full word count score awarded")

    # Use Groq to analyze relevance and quality
    try:
        prompt = f"""
        Analyze the following answer for its relevance to the question and quality of explanation.
        
        Question: {question}
        User Answer: {answer}
        
        Provide a detailed analysis and give the scores in JSON format with the following JSON and point structure ( STRICTLY MAINTAIN A PERFECT STRUCTURE AS BELOW):
        {{
            "relevance_score": (0-50 points),
            "quality_score": (0-50 points),
            "relevance_feedback": "short explanation of relevance score",
            "quality_feedback": "short explanation of quality score"
        }}

        MOSTLY DONT JUDGE THE ANSWERS STRICKLY , TRY TO GIVE HIGHER MARKS IF SOMEWHAT RELATED (25-35 points) and 40-50 MARKS ID GOOD ENOUGH.
        
        Base your scoring on:
        - Relevance: How well the answer addresses the specific question (0-50 points)
        - Quality: Clarity, depth, and coherence of the explanation (0-50 points)
        """



        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an English assessment expert. Provide detailed analysis in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.2-3b-preview",
            temperature=0.0,
        )
        
        # Parse the response
        analysis = eval(response.choices[0].message.content)
        relevance_score = float(analysis['relevance_score'])
        quality_score = float(analysis['quality_score'])

        detailed_feedback['relevance_score'] = relevance_score
        detailed_feedback['quality_score'] = quality_score
        
        # Add detailed feedback
        detailed_feedback["Relevance"] = analysis['relevance_feedback']
        detailed_feedback["Quality"] = analysis['quality_feedback']
        
    
        # If answer is completely irrelevant (relevance_score < 5), zero out the total score
        
        score = relevance_score + quality_score
        detailed_feedback['Remark'] = "Scores calculated based on relevance and quality analysis."


        detailed_feedback['score'] = score
            
    except Exception as e:
        detailed_feedback['error'] = f"Error in analysis: {str(e)}"
        score = 0  # Fall back to just word count score
    
    # Format the detailed feedback
    # feedback_text = "\n".join(detailed_feedback)
    
    return detailed_feedback

def check_answer_correctness(question: str, answer: str) -> Dict:
    """
    Main function to check answer correctness and provide feedback
    """
    detailedFeedback = analyze_response(question, answer)

    if detailedFeedback.get('error'):
        return {
            "error": detailedFeedback['error']
        }
    
    return {
        "score": detailedFeedback['score'],
        "relevance_score": detailedFeedback['relevance_score'],
        "quality_score": detailedFeedback['quality_score'],
        "Relevance": detailedFeedback['Relevance'],
        "Quality": detailedFeedback['Quality'],
        "remark": detailedFeedback['Remark'],
    }