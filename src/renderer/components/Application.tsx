import React, { useEffect, useState } from 'react';
import '@styles/app.scss';
import icons from '@components/icons';
import { Classes, Divider } from "@blueprintjs/core";

const Application: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [darkTheme, setDarkTheme] = useState(true);
  const [versions, setVersions] = useState<Record<string, string>>({});

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
    },
    column: {
      flex: 1,
      padding: '20px',
    },
  };

  
  /**
   * On component mount
   */
  useEffect(() => {
    const useDarkTheme = parseInt(localStorage.getItem('dark-mode'));
    if (isNaN(useDarkTheme)) {
      setDarkTheme(true);
    } else if (useDarkTheme == 1) {
      setDarkTheme(true);
    } else if (useDarkTheme == 0) {
      setDarkTheme(false);
    }

    // Apply verisons
    const app = document.getElementById('app');
    const versions = JSON.parse(app.getAttribute('data-versions'));
    setVersions(versions);
  }, []);

  /**
   * On Dark theme change
   */
  useEffect(() => {
    if (darkTheme) {
      localStorage.setItem('dark-mode', '1');
      document.body.classList.add('dark-mode');
    } else {
      localStorage.setItem('dark-mode', '0');
      document.body.classList.remove('dark-mode');
    }
  }, [darkTheme]);

  /**
   * Toggle Theme
   */
  function toggleTheme() {
    setDarkTheme(!darkTheme);
  }

  return (
    <div id='erwt'>
      <div style={styles.container}>
        <div style={styles.column}>
          <h2>左侧内容</h2>
          <p>这里是左侧分栏的内容。</p>
        </div>
        <Divider />
        <div style={styles.column}>
          <h2>右侧内容</h2>
          <p>这里是右侧分栏的内容。</p>
          <div className='footer'>
            <div className='center'>
              <button
                onClick={() => {
                  if (counter > 99) return alert('Going too high!!');
                  setCounter(counter + 1);
                }}
              >
                Increment {counter != 0 ? counter : ''} <span>{counter}</span>
              </button>
              &nbsp;&nbsp; &nbsp;&nbsp;
              <button
                onClick={() => {
                  if (counter == 0) return alert('Oops.. thats not possible!');
                  setCounter(counter > 0 ? counter - 1 : 0);
                }}
              >
                Decrement <span>{counter}</span>
              </button>
              &nbsp;&nbsp; &nbsp;&nbsp;
              <button onClick={toggleTheme}>
                {darkTheme ? 'Light Theme' : 'Dark Theme'}
              </button>
            </div>
          </div>
          
        </div>
      </div>


    </div>
  );
};

export default Application;
