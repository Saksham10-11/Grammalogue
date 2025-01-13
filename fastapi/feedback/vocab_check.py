from typing import Dict, List, Set

# Advanced vocabulary words categorized by type
ADVANCED_VOCABULARY = {
    "verbs": {
        "accomplish", "acquire", "advocate", "analyze", "assess", "collaborate",
        "comprehend", "contemplate", "demonstrate", "derive", "elaborate",
        "emphasize", "enhance", "establish", "evaluate", "facilitate",
        "generate", "implement", "incorporate", "investigate", "maintain",
        "optimize", "perceive", "pursue", "resolve", "synthesize", "utilize",
        "articulate", "cultivate", "differentiate", "exemplify", "formulate",
        "hypothesize", "integrate", "leverage", "mediate", "navigate",
        "orchestrate", "quantify", "rationalize", "streamline", "validate"
    },
    "adjectives": {
        "abundant", "adequate", "comprehensive", "crucial", "diverse",
        "efficient", "fundamental", "innovative", "integral", "optimal",
        "precise", "prominent", "robust", "significant", "sophisticated",
        "substantial", "versatile", "analytical", "cohesive", "empirical",
        "holistic", "imperative", "methodical", "nuanced", "paramount",
        "pragmatic", "quintessential", "systematic", "theoretical"
    },
    "adverbs": {
        "accordingly", "consequently", "effectively", "extensively",
        "fundamentally", "predominantly", "precisely", "primarily",
        "significantly", "substantially", "thoroughly", "analytically",
        "coherently", "decisively", "empirically", "intrinsically",
        "methodically", "objectively", "pragmatically", "strategically"
    },
    "transitions": {
        "additionally", "consequently", "furthermore", "however",
        "moreover", "nevertheless", "subsequently", "therefore",
        "alternatively", "comparatively", "conversely", "correspondingly",
        "essentially", "ultimately", "notwithstanding", "similarly",
        "specifically", "whereas"
    },
    "academic": {
        "analysis", "approach", "concept", "context", "data",
        "evidence", "framework", "hypothesis", "methodology",
        "perspective", "principle", "process", "research", "theory",
        "algorithm", "correlation", "discretion", "paradigm",
        "parameter", "phenomenon", "protocol", "synthesis",
        "threshold", "variable", "velocity", "criterion"
    }
}

def analyze_vocabulary(text: str) -> Dict:
    """
    Analyze the vocabulary usage in the given text.
    
    Args:
        text (str): The text to analyze
        
    Returns:
        Dict: Dictionary containing vocabulary analysis results
    """
    # Convert text to lowercase and split into words
    words = set(text.lower().split())
    
    # Initialize counters
    found_words: Dict[str, List[str]] = {category: [] for category in ADVANCED_VOCABULARY}
    total_advanced_words = 0
    
    # Check each category
    for category, word_set in ADVANCED_VOCABULARY.items():
        for word in word_set:
            if word in words:
                found_words[category].append(word)
                total_advanced_words += 1
    
    # Calculate vocabulary score
    # Base score of 50% if no advanced words are used
    # Additional 50% distributed based on number of advanced words used
    # Max score achieved with 10 or more advanced words
    max_expected_words = 10
    additional_score = min(50, (total_advanced_words / max_expected_words) * 50)
    vocabulary_score = 50 + additional_score

    # Get unique advanced words used
    all_found_words = set()
    for words_list in found_words.values():
        all_found_words.update(words_list)

    return {
        "vocabulary_score": round(vocabulary_score, 1),
        "total_advanced_words": total_advanced_words,
        "advanced_words_by_category": found_words,
        "unique_advanced_words": list(all_found_words),
        "feedback": generate_vocabulary_feedback(total_advanced_words, vocabulary_score)
    }

def generate_vocabulary_feedback(word_count: int, score: float) -> str:
    """
    Generate feedback message based on vocabulary usage.
    
    Args:
        word_count (int): Number of advanced words used
        score (float): Vocabulary score
        
    Returns:
        str: Feedback message
    """
    if score >= 90:
        return "Excellent vocabulary usage! Your language is sophisticated and varied."
    elif score >= 75:
        return "Good use of advanced vocabulary. Keep expanding your word choices."
    elif score >= 60:
        return "Decent vocabulary range. Try incorporating more varied expressions."
    else:
        return "Consider using more sophisticated vocabulary to enhance your expression."