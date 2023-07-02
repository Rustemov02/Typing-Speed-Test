import React, { useState, useEffect } from 'react';
import Count from './Count'
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, DialogTitle } from '@mui/material/';

export default function Test() {
  const [input, setInput] = useState('');
  // const words = ['apple', 'john', 'banana', 'qwerty', 'programming', 'apple2', 'john2', 'banana2', 'qwerty2', 'programming2', 'apple3', 'john3', 'banana3', 'qwerty3', 'programming3']; // 50 kelimenin tamamı burada
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


  const fetchWords = () => {
    fetch('https://random-word-api.herokuapp.com/word?number=100')
      .then(response => response.json())
      .then(data => setWords(data))
      .catch(error => console.error('Error fetching words:', error));
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
    setInterval(() => {
      setTimer(prevState => prevState - 1);
    }, 1000);
  };

  const handleKeyPress = e => {
    if (e.key == ' ' && !isActiveSpace) {
      setActiveSpace(true);
      setActiveWord(0);
      startCountdown();
    }
  };

  useEffect(() => {
    if (timer === 0) {
      alert(`Game over, your correct: ${correct}, wrong: ${wrong}`);
      window.location.reload();
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

  // FOR DIALOG 
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false);
  };

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
        <Count timer={timer} />
        <button onClick={() => window.location.reload()}>Restart</button>
      </div>


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Result</DialogTitle>
        <p>Correct : {correct}</p>
        <p>Wrong : {wrong}</p>
      </Dialog>
    </div>
  );
}
