import os
from groq import Groq
from typing import Dict, Optional
from fastapi import HTTPException
import unicodedata
import json
import logging

logging.basicConfig(level=logging.INFO)

class IdealAnswerGenerator:
    def __init__(self):
        api_key = os.environ.get("Grok_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.2-3b-preview"

    def parse_llm_response(response: str) -> Dict:
        """Parse and validate LLM response with unicode support."""
        # Normalize unicode characters
        normalized_response = unicodedata.normalize('NFKC', response)
        
        try:
            # Parse JSON with ensure_ascii=False to handle non-ASCII characters
            parsed = json.loads(normalized_response)
            
            # Validate required fields
            required_fields = ['ideal_answer', 'user_strengths', 
                            'areas_for_improvement', 'improvement_suggestions']
            
            if not all(field in parsed for field in required_fields):
                raise ValueError("Missing required fields in response")
                
            return parsed
            
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse response: {str(e)}"
            )


    async def generate_ideal_answer(self, question: str, user_answer: str) -> Dict:
        """
        Generate an grammatically correct answer and comparison with user's answer.
        
        Args:
            question (str): The original question
            user_answer (str): The user's answer to analyze
            
        Returns:
            Dict: Contains grammatically correct answer and analysis of user's answer
        """
        try:
            prompt = f"""
            Question: {question}
            User's Answer: {user_answer}""" + """
            
            Please provide:
            1. A corrected gramatical answer to this question
            2. Analysis of what the user did well
            3. Areas where the user's answer could be improved
            
            Format the response ONLY as a JSON with the following structure. THIS STRUCTURE SHOULD BE MAINTAINED STRICTLY:
            {
                "ideal_answer": "corrected gramatical answer with correct langauge as question",
                "user_strengths": "what the user did well with correct langauge as question",
                "areas_for_improvement": "where the answer could be improved with correct langauge as question",
            }

            """

            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a grammatical assessment expert. Provide analysis only in JSON format.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                temperature=0.1,
                model=self.model,
            )            
    
            response = chat_completion.choices[0].message.content

            logging.info(f"LLM response: {response}")
            
            # Add JSON parsing with error handling
            try:
                
                return {
                    "status": "success",
                    "data": response
                }
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to parse LLM response as JSON"
                )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate ideal answer: {str(e)}"
            )

# Create a singleton instance
# ideal_answer_generator = IdealAnswerGenerator()