import React, { useRef, useEffect, useState } from 'react';

const WaveformVisualizer = ({ isRecording, stream }) => {
  const canvasRef = useRef(null);
  const rafId = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const [isContextClosed, setIsContextClosed] = useState(true);

  useEffect(() => {
    if (stream && isRecording && isContextClosed) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      setIsContextClosed(false);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // More detailed settings
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.7; // More responsive
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      
      const draw = () => {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
        if (!isRecording) {
          ctx.beginPath();
          ctx.moveTo(0, HEIGHT / 2);
          ctx.lineTo(WIDTH, HEIGHT / 2);
          ctx.strokeStyle = '#073ca5';
          ctx.stroke();
          return;
        }
      
        analyserRef.current.getByteFrequencyData(dataArray);
      
        // Enhanced frequency bands
        const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
        const lowMids = dataArray.slice(10, 20).reduce((a, b) => a + b) / 10;
        const highMids = dataArray.slice(20, 40).reduce((a, b) => a + b) / 20;
        const highs = dataArray.slice(40, 60).reduce((a, b) => a + b) / 20;
        
        const baseAmplitude = HEIGHT / 7;
        const bassAmplitude = (bass * 1.4) / 256 * baseAmplitude;
        const midsAmplitude = (lowMids * 1.3) / 256 * baseAmplitude;
        const highMidsAmplitude = (highMids * 1.2) / 256 * baseAmplitude;
        const highsAmplitude = (highs * 1.1) / 256 * baseAmplitude;

        const drawWave = (
          offset,
          frequency,
          phase,
          color1,
          color2,
          alpha,
          waveAmplitude,
          direction = 1
        ) => {
          ctx.beginPath();
          ctx.lineWidth = 2;
        
          const gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
          gradient.addColorStop(0, `rgba(${color1}, ${alpha})`);
          gradient.addColorStop(1, `rgba(${color2}, ${alpha})`);
          ctx.strokeStyle = gradient;
        
          ctx.shadowBlur = 5;
          ctx.shadowColor = `rgba(${color1}, ${alpha * 0.5})`;
        
          const points = 100;
          for (let i = 0; i <= points; i++) {
            const x = (WIDTH / points) * i;
            const wave = Math.sin(i * frequency + Date.now() * phase * direction);
            const detail = Math.sin(i * frequency * 2.5 + Date.now() * phase * 1.8 * direction) * 0.15;
            const microDetail = Math.sin(i * frequency * 4 + Date.now() * phase * 2.2 * direction) * 0.05;
            
            // Now using the passed waveAmplitude parameter
            const y = HEIGHT / 2 + (wave + detail + microDetail) * waveAmplitude + offset;
        
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
          ctx.shadowBlur = 0;
        };
        
        
        // Updated wave calls with alternating directions
        drawWave(-2, 0.08, 0.003, "255,91,0", "255,188,0", 0.9, bassAmplitude, 1);      // Bass wave
        drawWave(-1, 0.15, 0.004, "204,5,48", "255,91,0", 0.4, midsAmplitude, -1);    // Mids wave
        drawWave(2, 0.18, 0.003, "255,130,0", "255,200,0", 0.3, highMidsAmplitude, 1);  // High-mids wave
        drawWave(0, 0.22, 0.002, "255,160,0", "255,220,0", 0.2, highsAmplitude, -1);    // Highs wave
      
        rafId.current = requestAnimationFrame(draw);
      };

      draw();
    }

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().then(() => {
          setIsContextClosed(true);
        }).catch(err => {
          console.warn('Error closing AudioContext:', err);
        });
      }
    };
  }, [isRecording, stream]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={100}
      className="w-full h-full rounded-lg bg-gray-50"
    />
  );
};

export default WaveformVisualizer;