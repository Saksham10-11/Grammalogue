import librosa
import numpy as np
import soundfile as sf

def detect_pauses(audio_path, threshold_seconds=1, amplitude_threshold=0.01):
    """
    Detect pauses in an audio file.
    
    Parameters:
    - audio_path (str): Path to the input audio file
    - threshold_seconds (float): Minimum duration to count as a pause (default: 0.5 seconds)
    - amplitude_threshold (float): Amplitude threshold to consider as silence (default: 0.01)
    
    Returns:
    - dict: Pause detection results
    """
    # Load the audio file
    audio, sample_rate = librosa.load(audio_path, sr=None)
    
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

def main():
    # Example usage
    audio_file_path = 'temp_audio/file.mp4'  # You can use MP4 or any audio file
    
    try:
        # Detect pauses
        pause_analysis = detect_pauses(audio_file_path)
        
        # Print results
        print(f"Total number of pauses: {pause_analysis['total_pauses']}")
        print(f"Total pause duration: {pause_analysis['total_pause_duration']:.2f} seconds")
        
        # Print details of each pause
        print("\nPause Details:")
        for i, pause in enumerate(pause_analysis['pause_details'], 1):
            print(f"Pause {i}:")
            print(f"  Start time: {pause['start']:.2f} seconds")
            print(f"  End time: {pause['end']:.2f} seconds")
            print(f"  Duration: {pause['duration']:.2f} seconds")
    
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()

# Dependencies:
# Install required libraries using pip:
# pip install librosa soundfile numpy