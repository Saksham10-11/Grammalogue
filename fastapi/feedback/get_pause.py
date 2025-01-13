import os 
import logging
import librosa
import numpy as np
from scipy.signal import butter, filtfilt

logging.basicConfig(level=logging.INFO)



def get_pause_count(audio_path, threshold_seconds=0.8, amplitude_threshold=0.015):
    # Load the audio file
    audio, sample_rate = librosa.load(audio_path, sr=None)

    logging.info(f"Loaded audio file with sample rate {audio_path}")
    
    # Calculate the time resolution
    hop_length = 512
    
    # Extract the envelope (amplitude) of the audio signal
    audio_envelope = librosa.onset.onset_strength(y=audio, sr=sample_rate, hop_length=hop_length)
    
    # Convert envelope to time in seconds
    times = librosa.times_like(audio_envelope, sr=sample_rate, hop_length=hop_length)
    
    # Detect periods of silence
    pauses = []
    in_pause = False
    pause_start = 0
    
    for i in range(len(audio_envelope)):
        # Check if current segment is below amplitude threshold
        logging.info(f"Amplitude: {audio_envelope[i]}")
        if audio_envelope[i] < amplitude_threshold:
            if not in_pause:
                # Start of a pause
                pause_start = times[i]
                in_pause = True
        else:
            if in_pause:
                # End of a pause
                pause_duration = times[i] - pause_start
                if pause_duration >= threshold_seconds:
                    pauses.append({
                        'start': pause_start,
                        'end': times[i],
                        'duration': pause_duration
                    })
                in_pause = False
    
    # If the audio ends while in a pause
    if in_pause:
        pause_duration = times[-1] - pause_start
        if pause_duration >= threshold_seconds:
            pauses.append({
                'start': pause_start,
                'end': times[-1],
                'duration': pause_duration
            })
    
    return {
        'total_pauses': len(pauses),
        'pause_details': pauses,
        'total_pause_duration': sum(pause['duration'] for pause in pauses)
    }

