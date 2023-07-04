import React, { useState, useEffect } from 'react';
import Count from './Count'
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog} from '@mui/material/';

export default function App() {
  const [input, setInput] = useState('');
  const [words, setWords] = useState([])
  const [countActiveWord, setCountActiveWord] = useState(0);
  const [activeWord, setActiveWord] = useState(0);
  const [wordColors, setWordColors] = useState({});
  const [timer, setTimer] = useState(59);
  const [isActiveSpace, setActiveSpace] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const wordsPerPage = 12; // Sayfa başına gösterilecek kelime sayısı
  const [currentPage, setCurrentPage] = useState(0); // Geçerli sayfa indeksi
  const [showCircular, setShowCircular] = useState(true)
  let countdown

  const fetchWords = () => {
    fetch('https://random-word-api.herokuapp.com/word?number=100')
      .then(response => response.json())
      .then(data => setWords(data))
      .catch((error) => alert("there may be a problem with your internet", error));
  };
 
  const handleChange = e => {
    setInput(e.target.value);
    if (e.nativeEvent.data === ' ') {
      const currentWord = words[countActiveWord];
      const isCorrect = input.trim() === currentWord;
      isCorrect ? setCorrect(prevState => prevState + 1) : setWrong(prevState => prevState + 1)

      setWordColors(prevColors => ({
        ...prevColors,
        [currentWord]: isCorrect ? 'limegreen' : 'red'
      }));

      setActiveWord(prevState => prevState + 1);
      setCountActiveWord(prevState => prevState + 1);
      setInput('');

      if (countActiveWord + 1 === words.length) {
        fetchWords();
      }
    }
  };

  const startCountdown = () => {
    countdown = setInterval(() => {
      setTimer(prevState => {
        if(prevState === 0){
          clearInterval(countdown)
          return prevState
        }else {
          return prevState - 1
        }
      });
    }, 1000);
  }; 

  const handleKeyPress = e => {
    if (e.key == ' ' && !isActiveSpace) {
      setActiveSpace(true);
      setActiveWord(0);
      startCountdown();
    }
  };

  // FOR DIALOG 
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };

  //  GAME OVER 
  useEffect(() => {
    if (timer === 0) {
      setOpen(true) 
    }
  }, [timer]);
 
  useEffect(() => {
    if (countActiveWord >= (currentPage + 1) * wordsPerPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  }, [countActiveWord]);

  useEffect(() => {
    fetchWords();

    const timer = setTimeout(() => {
      setShowCircular(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
 
  const renderWords = () => {
    const startIndex = currentPage * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    const currentWords = words.slice(startIndex, endIndex);

    return currentWords.map((item, index) => (
      <p
        key={startIndex + index}
        style={{
          color: wordColors[item] || 'black ',
          padding: '3px 5px'
        }}
        className={activeWord === startIndex + index ? 'activeWord' : 'deactive-word'}
      >
        {item}
      </p>
    ));
  };

  return (
    <div className='wrapper'>

      <div className='words-area'>
        {showCircular && <CircularProgress />}
        {!showCircular && renderWords()}
      </div>

      <div className='typing-area'>
        <input type="text" value={input} onChange={handleChange} onKeyPress={handleKeyPress} />
        <div style={{display : 'flex',flexDirection : "row",margin : '5px',alignItems: 'center'}}>
        <Count timer={timer} />
        <button className='restart-button' onClick={() => window.location.reload()}>Restart</button>
        </div>
      </div>


      <Dialog open={open} onClose={handleClose} className='dialog'>
        <h2>Result</h2>
        <p>Correct : {correct}</p>
        <p>Wrong : {wrong}</p>
        <button className='restart-button dialog-button' onClick={()=>window.location.reload()}>Restart</button>
      </Dialog>
    </div>
  );
}
