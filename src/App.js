import React, { useState, useRef, useEffect, useCallback } from 'react';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stage, setStage] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [transformedText, setTransformedText] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [ttsUrl, setTtsUrl] = useState(null);
  const [musicUrl, setMusicUrl] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingMusic, setGeneratingMusic] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [delaying, setDelaying] = useState(false);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    audioChunksRef.current = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        fetch('https://okaku-whole-back.onrender.com/recognize', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          setRecognizedText(data.recognized_text);
          setOriginalText(data.original_text);
          setTransformedText(data.transformed_text);
          textToSpeech(data.transformed_text);
          generateImage(data.transformed_text);
        })
        .catch(error => console.error('Error:', error))
        .finally(() => setIsRecording(false));
      };

      mediaRecorder.start();
    }).catch(error => {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
    });
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const handleEnterPress = useCallback(() => {
      if (stage === 0) {
        setStage(1);
      } else if (stage === 1 && !isRecording) {
        handleStartRecording();
      } else if (stage === 1 && isRecording) {
        handleStopRecording();
        setTimeout(() => {
          setDelaying(false);
          setStage(2);
        }, 2000); // 2秒待機
      } else if (stage === 2) {
        setStage(3);
      } else if (stage === 3) {
        generateMusic(data.transformed_text);
        setStage(4);
      } else if (stage === 4) {
        setStage(5);
      } else if (stage === 5) {
        setStage(0);
      }
    }, [isRecording, stage, handleStartRecording, handleStopRecording]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleEnterPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEnterPress]);

  const generateImage = (transformedText) => {
    setGeneratingImage(true);
    fetch('https://okaku-whole-back.onrender.com/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transformed_text: transformedText })
    })
    .then(response => response.json())
    .then(data => setImageUrl(`https://okaku-whole-back.onrender.com/generated/${data.imagePath}`))
    .catch(error => {
      console.error('Error generating image:', error);
      setImageUrl(null); // Reset image on error
    })
    .finally(() => setGeneratingImage(false));
  };

  const generateMusic = (transformedText) => {
    setGeneratingMusic(true);
    fetch('https://okaku-whole-back.onrender.com/generate-music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transformed_text: transformedText })
    })
    .then(response => response.json())
    .then(data => setMusicUrl(`https://okaku-whole-back.onrender.com/generated/${data.musicPath}`))
    .catch(error => {
      console.error('Error generating music:', error);
      setMusicUrl(null); // Reset music on error
    })
    .finally(() => setGeneratingMusic(false));
  };

  const textToSpeech = (transformedText) => {
    fetch('https://okaku-whole-back.onrender.com/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transformed_text: transformedText })
    })
    .then(response => response.json())
    .then(data => setTtsUrl(`https://okaku-whole-back.onrender.com/generated/${data.ttsPath}`))
    .catch(error => {
      console.error('Error generating text-to-speech:', error);
      setTtsUrl(null); // Reset TTS on error
    });
  };

  return (
    <div style={{ fontFamily: 'Kozuka Gothic', textAlign: 'center', backgroundColor: 'black', color: 'white', height: '100vh', padding: '20px', overflow: 'auto' }}>
      {stage === 0 && (
        <div>
          <p>Language is a virus from outerspace</p>
          <p>言語は外部からきたウイルス</p>
          <p>that’s why I’d hear your name</p>
          <p>rather than see your face</p>
          <p></p>
          <p>ことばがみえるひと</p>
          <p>このことばのいみがわかるなら</p>
          <p></p>
          <p>↓</p>
          <p>↓</p>
          <p>↓</p>
          <p></p>
          <p>め　の　まえ　の</p>
          <p>ぼ た ん を おして</p>
          <p>あなたのなまえという</p>
          <p>こと　ばを きか　せて</p>
          <p> く だ さい</p>
          <p></p>
          <p>↓</p>
          <p>↓</p>
          <p>↓</p>
          <p></p>
          <p>ぼたんをおす</p>
          <p>press the button</p>
        </div>
      )}
      {stage === 1 && (
        <div>
          <p>なまえをおしえて</p>
          <p>tell me your name</p>
        </div>
      )}
      {stage === 2 && (
        <div>
          <p>なまえをおしえて</p>
          <p>tell me your name</p>
          <p></p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>{recognizedText}</p>
          </div>
        </div>
      )}
      {stage === 3 && (
        <div>
          <div>
            {transformedText.split('').map((char, index) => (
              <span key={index} style={{ color: originalText[index] !== char ? 'red' : 'white' }}>{char}</span>
            ))}
          </div>
        <audio src={ttsUrl} autoPlay />
        </div>
      )}
      {stage === 4 && (
        <div>
          <img src={imageUrl} alt="Generated" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'black' }} />
        </div>
      )}
      {stage === 5 && (
        <div>
          <audio src={musicUrl} autoPlay />
          <p></p>
          <p>あなたの名前の</p>
          <p>おと</p>
          <p>が情報となり</p>
          <p>合理的なアルゴリズムで</p>
          <p>統計的処理が施され</p>
          <p>ましたが</p>
          <p>外側世界の</p>
          <p>変化がまた一つ</p>
          <p>増殖されました</p>
          <p>→</p>
          <p>さぁ、Spaceから</p>
          <p>出て、拡散しましょう</p>
          <p></p>
          <p>The sound of your name</p>
          <p>became information,</p>
          <p>processed by a rational algorithm</p>
          <p>with statistical analysis,</p>
          <p>and another change</p>
          <p>was propagated</p>
          <p>in the external world.</p>
          <p>→</p>
          <p>Now, let's leave the</p>
          <p>Space and spread.</p>
        </div>
      )}
    </div>
  );
};

export default App;
