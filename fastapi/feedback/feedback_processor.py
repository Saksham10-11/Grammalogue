import os
import json
import re
from groq import Groq
from typing import Dict, List, Optional
from dotenv import load_dotenv
from .check_correctness import check_answer_correctness
from .vocab_check import analyze_vocabulary
from .get_pause import get_pause_count

# Load environment variables
load_dotenv()

class FeedbackProcessor:
    def __init__(self):
        self.client = Groq(
            api_key=os.getenv("Grok_API_KEY"),
        )

        self.grammar_prompt = """You are a grammar expert. Analyze the given text for grammatical errors, focusing ONLY on:
        - Incorrect verb tenses (e.g., "I goes" instead of "I go")
        - Subject-verb agreement errors
        - Incorrect use of pronouns
        - Incorrect word usage or word choice
        - Run-on sentences or sentence fragments
        - Incorrect preposition usage
        - Spelling errors
        
        DO NOT flag or count:
        - Don't count the capitalization errors as grammar errors
        - Capitalization issues (e.g., 'i' vs 'I')(remember these are not grammar errors)
        - Missing periods at the end of sentences
        - Stylistic choices
        
        Format your response as a JSON object with two fields:
        {
            "error_count": number,
            "errors": [
                {
                    "word": "incorrect_phrase_or_word",
                    "suggestion": "correct_phrase_or_word",
                    "explanation": "brief explanation of the error"
                }
            ]
        }
        
        Return ONLY the JSON object, no additional text."""

        self.pronunciation_prompt = """You are a pronunciation expert. Analyze the given text for potential pronunciation challenges and mistakes, focusing on:
        - Common pronunciation difficulties for non-native speakers
        - Words with silent letters
        - Complex phonetic combinations
        - Stress patterns in multi-syllable words
        - Commonly mispronounced words
        - Sound pairs that are often confused (e.g., "th" vs "d")
        
        Format your response as a JSON object with two fields:
        {
            "error_count": number,
            "errors": [
                {
                    "word": "challenging_word",
                    "phonetic": "phonetic_representation",
                    "explanation": "brief explanation of the pronunciation challenge"
                }
            ]
        }
        
        Return ONLY the JSON object, no additional text."""

    def analyze_fluency(self, text: str) -> Dict:
        """
        Analyze text for fluency by detecting filler words and hesitations.
        Returns a dictionary containing fluency metrics.
        """
        # List of common filler words and hesitation sounds
        filler_patterns = [
            r'\b(hmm+|um+|uh+|aaa+|aa+|mmm+|mm+|ah+|er+|erm+|uhm+|uhmm+|uhhuh|uhuh)\b',
            r'\b(like|you know|basically|actually|literally|sort of|kind of)\b'
        ]

        # Combine patterns into one regex
        combined_pattern = '|'.join(filler_patterns)
        
        # Find all matches
        matches = re.finditer(combined_pattern, text.lower())
        
        # Store all filler words with their positions
        filler_words = []
        total_count = 0
        
        for match in matches:
            filler_words.append({
                "word": match.group(),
                "position": match.start(),
                "context": text[max(0, match.start()-20):min(len(text), match.end()+20)]
            })
            total_count += 1

        # Calculate fluency score (100 - deductions)
        # Deduct points based on the frequency of filler words
        words_in_text = len(text.split())
        filler_ratio = total_count / max(1, words_in_text)
        fluency_score = max(0, min(100, 100 - (filler_ratio * 200)))  # Deduct more points for higher filler word density

        return {
            "fluency_score": round(fluency_score, 1),
            "filler_word_count": total_count,
            "filler_words": filler_words,
            "words_analyzed": words_in_text,
            "filler_ratio": round(filler_ratio * 100, 1),
            "feedback": self._generate_fluency_feedback(total_count, words_in_text, fluency_score)
        }

    def _generate_fluency_feedback(self, filler_count: int, total_words: int, fluency_score: float) -> str:
        """Generate feedback message based on fluency analysis."""
        if fluency_score >= 90:
            return "Excellent fluency! Your speech flows naturally with minimal use of filler words."
        elif fluency_score >= 75:
            return "Good fluency overall. Consider reducing the use of filler words slightly to improve clarity."
        elif fluency_score >= 60:
            return "Moderate fluency. Try to be more conscious of filler words and practice speaking with more confidence."
        else:
            return "Your speech contains frequent filler words which may affect clarity. Focus on reducing hesitations and practice speaking with more confidence."

    async def analyze_grammar(self, text: str) -> Dict:
        """
        Analyze text for grammar mistakes using Groq LLM.
        """
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": self.grammar_prompt,
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this text: {text}",
                    }
                ],
                model="llama-3.2-3b-preview",
                temperature=0.1,
            )
            
            analysis = response.choices[0].message.content
            return self._parse_grammar_response(analysis)
        except Exception as e:
            print(f"Error in analyze_grammar: {str(e)}")
            return {
                "error_count": 0,
                "errors": []
            }

    async def analyze_pronunciation(self, text: str) -> Dict:
        """
        Analyze text for pronunciation challenges using Groq LLM.
        """
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": self.pronunciation_prompt,
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this text: {text}",
                    }
                ],
                model="llama-3.2-3b-preview",
                temperature=0.1,
            )
            
            analysis = response.choices[0].message.content
            return self._parse_pronunciation_response(analysis)
        except Exception as e:
            print(f"Error in analyze_pronunciation: {str(e)}")
            return {
                "error_count": 0,
                "errors": []
            }

        
    async def analyze_pauses(self, text: str, tempFileName: str) -> Dict:
        """
        Analyze text for pauses using the pause count from the audio file.
        Returns a dictionary containing pause analysis.
        """
        try:
            # Get the pause analysis from the audio file
            pause_analysis = get_pause_count(tempFileName)
            return pause_analysis
        except Exception as e:
            print(f"Error in analyze_pauses: {str(e)}")
            return {
                "total_pauses": 0,
                "pause_details": [],
                "total_pause_duration": 0
            }

    def _parse_grammar_response(self, response: str) -> Dict:
        """
        Parse the LLM response for grammar analysis.
        """
        try:
            # Parse the JSON response
            data = json.loads(response)
            return {
                "error_count": data.get("error_count", 0),
                "errors": data.get("errors", [])
            }
        except Exception as e:
            print(f"Error parsing grammar response: {str(e)}")
            return {
                "error_count": 0,
                "errors": []
            }

    def _parse_pronunciation_response(self, response: str) -> Dict:
        """
        Parse the LLM response for pronunciation analysis.
        """
        try:
            # Parse the JSON response
            data = json.loads(response)
            return {
                "error_count": data.get("error_count", 0),
                "errors": data.get("errors", [])
            }
        except Exception as e:
            print(f"Error parsing pronunciation response: {str(e)}")
            return {
                "error_count": 0,
                "errors": []
            }

    async def analyze_text(self, text: str, question: Optional[str] = None, tempFileName: str = '') -> Dict:
        """
        Analyze text for grammar, pronunciation, vocabulary, fluency and answer correctness.
        """
        grammar_analysis = await self.analyze_grammar(text)
        pronunciation_analysis = await self.analyze_pronunciation(text)
        vocabulary_analysis = analyze_vocabulary(text)
        fluency_analysis = self.analyze_fluency(text)

        pause_analysis = await self.analyze_pauses(text, tempFileName)
        correctness_analysis = check_answer_correctness(question, text)
   

        feedback = {
            "grammar": grammar_analysis,
            "pronunciation": pronunciation_analysis,
            "vocabulary": vocabulary_analysis,
            "fluency": fluency_analysis,
            "pauses": pause_analysis,  # Now returning the complete pause analysis
            "correctness": correctness_analysis,
            "text": text
        }

        return feedback