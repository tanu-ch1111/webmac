document.addEventListener('DOMContentLoaded', () => {
  const lockScreen = document.getElementById('lock-screen');
  const passwordInput = document.getElementById('passwordInput');
  const loginButton = document.getElementById('loginButton');
  function handleLogin() {
    lockScreen.classList.add('fade-out');
  }
  loginButton.addEventListener('click', handleLogin);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });
  const desktop = document.getElementById('desktop');
  const dock = document.getElementById('dock');
  let zIndexCounter = 100;
  const appContents = {
    'Finder': `
      <h3>Finder</h3>
      <p>This is a simulated Finder window.</p>
    `,
    'Notepad': `
      <h3>TextEdit</h3>
      <textarea placeholder="Type your text here..."></textarea>
    `,
    'Terminal': `
      <div class="terminal-output">
        Welcome to Web Terminal.<br>
        Type 'help' to see a list of available commands.
      </div>
      <div class="terminal-input-line">
        <span class="terminal-input-prompt">$</span>
        <input type="text" class="terminal-input" autofocus>
      </div>
    `,
    'Chrome': `
      <div class="chrome-url-bar">
        <input type="text" class="chrome-url-input" placeholder="https://www.google.com" value="https://www.google.com">
        <button class="chrome-go-btn">Go</button>
      </div>
      <div class="chrome-iframe-container">
        <iframe class="chrome-iframe" src="https://www.google.com"></iframe>
      </div>
    `
  };
  function createWindow(title, contentHTML) {
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    if (title === 'Terminal') {
      windowEl.classList.add('terminal-window');
    } else if (title === 'Chrome') {
      windowEl.classList.add('chrome-window');
    }
    windowEl.style.top = `${Math.random() * 100 + 100}px`;
    windowEl.style.left = `${Math.random() * 100 + 100}px`;
    windowEl.style.zIndex = ++zIndexCounter;
    windowEl.innerHTML = `
      <div class="window-title-bar">
        <div class="window-title-bar-buttons">
          <button class="close-btn"></button>
          <button class="minimize-btn"></button>
          <button class="maximize-btn"></button>
        </div>
        <span>${title}</span>
      </div>
      <div class="window-content">
        ${contentHTML}
      </div>
    `;
    desktop.appendChild(windowEl);
    makeWindowDraggable(windowEl);
    makeWindowActiveOnFocus(windowEl);
    setupWindowButtons(windowEl);
    makeWindowResizable(windowEl);
    if (title === 'Terminal') {
      const inputEl = windowEl.querySelector('.terminal-input');
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleTerminalInput(inputEl, windowEl.querySelector('.terminal-output'));
        }
      });
      inputEl.focus();
    }
    if (title === 'Chrome') {
      const urlInput = windowEl.querySelector('.chrome-url-input');
      const goBtn = windowEl.querySelector('.chrome-go-btn');
      const iframe = windowEl.querySelector('.chrome-iframe');
      function loadUrl() {
        let url = urlInput.value;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        iframe.src = url;
      }
      goBtn.addEventListener('click', loadUrl);
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          loadUrl();
        }
      });
    }
    return windowEl;
  }
  function makeWindowDraggable(windowEl) {
    const titleBar = windowEl.querySelector('.window-title-bar');
    let isDragging = false;
    let startX, startY, initialX, initialY;
    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('.chrome-url-bar')) return;
      isDragging = true;
      initialX = windowEl.offsetLeft;
      initialY = windowEl.offsetTop;
      startX = e.clientX;
      startY = e.clientY;
    });
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        windowEl.style.left = `${initialX + dx}px`;
        windowEl.style.top = `${initialY + dy}px`;
      }
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  function makeWindowResizable(windowEl) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    windowEl.addEventListener('mousedown', (e) => {
      const rect = windowEl.getBoundingClientRect();
      const edgeThreshold = 10;
      const isAtRight = Math.abs(e.clientX - rect.right) < edgeThreshold;
      const isAtBottom = Math.abs(e.clientY - rect.bottom) < edgeThreshold;
      if (isAtRight || isAtBottom) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = windowEl.offsetWidth;
        startHeight = windowEl.offsetHeight;
        windowEl.style.userSelect = 'none';
      }
    });
    document.addEventListener('mousemove', (e) => {
      if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newWidth = startWidth + dx;
        const newHeight = startHeight + dy;
        if (newWidth >= parseInt(windowEl.style.minWidth)) {
          windowEl.style.width = `${newWidth}px`;
        }
        if (newHeight >= parseInt(windowEl.style.minHeight)) {
          windowEl.style.height = `${newHeight}px`;
        }
      }
    });
    document.addEventListener('mouseup', () => {
      isResizing = false;
      windowEl.style.userSelect = 'auto';
    });
  }
  function makeWindowActiveOnFocus(windowEl) {
    windowEl.addEventListener('mousedown', (e) => {
      windowEl.style.zIndex = ++zIndexCounter;
    });
  }
  function setupWindowButtons(windowEl) {
    windowEl.querySelector('.close-btn').addEventListener('click', () => {
      windowEl.remove();
    });
    windowEl.querySelector('.minimize-btn').addEventListener('click', () => {
      windowEl.style.display = 'none';
    });
    let isMaximized = false;
    let originalPosition = {
      top: 0,
      left: 0,
      width: 0,
      height: 0
    };
    windowEl.querySelector('.maximize-btn').addEventListener('click', () => {
      if (!isMaximized) {
        originalPosition = {
          top: windowEl.style.top,
          left: windowEl.style.left,
          width: windowEl.style.width,
          height: windowEl.style.height
        };
        windowEl.style.top = '10%';
        windowEl.style.left = '10%';
        windowEl.style.width = '80%';
        windowEl.style.height = '80%';
      } else {
        windowEl.style.top = originalPosition.top;
        windowEl.style.left = originalPosition.left;
        windowEl.style.width = originalPosition.width;
        windowEl.style.height = originalPosition.height;
      }
      isMaximized = !isMaximized;
    });
  }
  function handleTerminalInput(inputEl, outputEl) {
    const command = inputEl.value.trim();
    if (command === '') return;
    outputEl.innerHTML += `<br><span style="color: #0f0;">$</span> ${command}<br>`;
    let output = '';
    const commandArgs = command.split(' ');
    const mainCommand = commandArgs[0];
    const target = commandArgs[1];
    switch (mainCommand) {
      case 'help':
        output = `Available commands:<br>
- help: Show this help message.<br>
- echo [text]: Print the given text.<br>
- ping [host]: Send dummy ping requests.<br>
- clear: Clear the terminal screen.<br>
- date: Show the current date.<br>
- whoami: Show the current user.`;
        break;
      case 'echo':
        output = commandArgs.slice(1).join(' ');
        break;
      case 'ping':
        if (target) {
          const host = target;
          output = `Pinging ${host} with 32 bytes of data:<br>`;
          for (let i = 0; i < 4; i++) {
            const time = Math.floor(Math.random() * 50) + 10;
            output += `Reply from ${host}: bytes=32 time=${time}ms TTL=128<br>`;
          }
          output += `<br>Ping statistics for ${host}:<br>`;
          output += `  Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),<br>`;
          output += `Approximate round trip times in milli-seconds:<br>`;
          output += `  Minimum = 12ms, Maximum = 48ms, Average = 31ms`;
        } else {
          output = 'Usage: ping [host]';
        }
        break;
      case 'clear':
        outputEl.textContent = '';
        break;
      case 'date':
        output = new Date().toString();
        break;
      case 'whoami':
        output = 'web-user';
        break;
      default:
        output = `command not found: ${command}`;
        break;
    }
    if (mainCommand !== 'clear') {
      outputEl.innerHTML += output + '<br>';
    }
    outputEl.scrollTop = outputEl.scrollHeight;
    inputEl.value = '';
  }
  dock.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const appName = e.currentTarget.dataset.app;
      if (appName && appContents[appName]) {
        createWindow(appName, appContents[appName]);
      }
    });
  });
});
