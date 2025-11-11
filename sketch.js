// Constants for the grid and effect
const numb = 70; 
const step = 10; 
const distThreshold = 70; 
const distortionAmount = 20; 
let dots = []; 
let profileImage; // 🌟 新增：用於存儲個人圖片

// 🌟 更新：作品連結和新的名稱對應
const externalLinks = {
    '單元一作品': 'https://zyeii06.github.io/20251014_4/',
    '單元一筆記': 'https://hackmd.io/@lcienz/BJBl5dyngg',
    '測驗系統': 'https://zyeii06.github.io/-/',
    '測驗卷筆記': 'https://hackmd.io/@lcienz/rkESw6dk-l', // 請替換成您的測驗卷筆記連結
    '作品筆記': '#',
    '淡江大學': {
        '淡江大學官網': 'https://www.tku.edu.tw/',
        '教育科技學系官網': 'https://www.et.tku.edu.tw/',
    }
};

const interactiveTexts = [
    "教科一A 呂俞錚 414730670",
    "大家好，我是呂俞錚",
    "畢業於內湖高工應用英文科",
    "我喜歡記錄生活和追劇"
];
let currentTextIndex = 0;
// 🌟 新增：文字動畫相關變數
let isTextAnimating = false;
let textAnimationStart = 0;
const textAnimationDuration = 600; // 動畫總時長 (毫秒) - 延長時間以顯示彈簧效果
const textJumpHeight = 20; // 跳動高度 (像素)
let textYOffset = 0;
let textChangedDuringAnimation = false;

// 🌟 新增：貓咪耳朵動畫相關變數
let isEarAnimating = false;
let earAnimationStart = 0;
const earAnimationDuration = 400; // 耳朵動畫時長
let earOffsetY = 0; // 耳朵垂直位移

// iframe 相關變數
let contentFrame; 
const iframeScale = 0.8; 

// 選單相關變數
let menuContainer;
let hamburger; // 🌟 新增：漢堡圖示的引用

// 🌟 更新：作品樣式配置，使用新的名稱作為 Key
const styles = {
    '單元一作品': { // 馬卡龍粉 + 奶油白
        background: [255, 204, 204],    
        dotColor: [255, 255, 240]     
    },
    '單元一筆記': { // 馬卡龍藍 + 檸檬黃
        background: [173, 216, 230], 
        dotColor: [253, 253, 150]   
    },
    '測驗系統': { // 薄荷綠 + 奶油白
        background: [189, 236, 182],
        dotColor: [255, 255, 240]
    },
    '測驗卷筆記': { // 蜜桃粉 + 天空藍
        background: [255, 218, 185],
        dotColor: [135, 206, 250]
    },
    '作品筆記': { // 淺灰 + 柔粉
        background: [211, 211, 211],
        dotColor: [255, 192, 203]
    },
    '淡江大學': { // 新增：淡江大學主選單的樣式
        background: [221, 160, 221],
        dotColor: [255, 255, 240]
    },
    '淡江大學': { // 淺紫 + 奶油白 (與子選單官網相同)
        background: [221, 160, 221],
        dotColor: [255, 255, 240]
    },
    '淡江大學官網': { // 淺紫 + 奶油白
        background: [221, 160, 221],
        dotColor: [255, 255, 240]
    },
    '教育科技學系': { // 鵝黃 + 深藍
        background: [255, 255, 204],
        dotColor: [0, 0, 139]
    },
    '教育科技學系官網': { // 鵝黃 + 深藍
        background: [255, 255, 204],
        dotColor: [0, 0, 139]
    },
    '關閉作品': { // 奶油黃 + 薰衣草紫
        background: [255, 248, 220], 
        dotColor: [200, 162, 200]      
    }
};

let currentWork = '關閉作品'; // 初始為關閉作品，顯示動畫

// 🌟 新增：定義首頁按鈕的名稱
const homeButtonName = '回到首頁';
styles['回到首頁'] = styles['關閉作品']; // 讓「回到首頁」使用與「關閉作品」相同的樣式


// The Dot class (保持不變)
class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y); 
    this.origin = this.pos.copy(); 
    this.speed = createVector(0, 0); 
  }
  
  update(m) {
    let mouseToOrigin = this.origin.copy();
    mouseToOrigin.sub(m);
    const d = mouseToOrigin.mag();
    const c = map(d, 0, distThreshold, 0, PI);
    
    mouseToOrigin.normalize();
    mouseToOrigin.mult(distortionAmount * sin(c));
    const target = createVector(this.origin.x + mouseToOrigin.x, this.origin.y + mouseToOrigin.y);

    let strokeWidth;
    if (d < distThreshold) {
      strokeWidth = 1 + 10 * abs(cos(c / 2));
    } else {
      strokeWidth = map(min(d, max(width, height)), 0, max(width, height), 5, 0.1);
    }
    
    let acceleration = this.pos.copy();
    acceleration.sub(target);
    acceleration.mult(-map(m.dist(this.pos), 0, 2 * max(width, height), 0.1, 0.01));
    
    this.speed.add(acceleration);
    this.speed.mult(0.87);
    this.pos.add(this.speed);

    strokeWeight(strokeWidth);
    point(this.pos.x, this.pos.y);
  }
}

// 初始化點陣列，確保置中
function initializeDots() {
    dots = []; 
    const gridDim = numb * step;
    const dx = (width - gridDim) / 2; 
    const dy = (height - gridDim) / 2; 
    
    for (let i = 0; i < numb; i++) {
        dots[i] = [];
        for (let j = 0; j < numb; j++) {
            const x = i * step + dx;
            const y = j * step + dy;
            dots[i][j] = new Dot(x, y);
        }
    }
}

// 核心切換邏輯：控制 iframe
function changeWork(workName) {
    // 如果點擊的是「回到首頁」，則行為與「關閉作品」一致
    if (workName === homeButtonName) {
        currentWork = '關閉作品';
    } else {
        currentWork = workName;
    }

    let link;
    // 檢查是否為巢狀連結
    if (externalLinks['淡江大學'][workName]) {
        link = externalLinks['淡江大學'][workName];
    } else {
        link = externalLinks[workName]; // 取得對應的連結
    }




    // 處理巢狀連結，如果 currentWork 是父選單的名稱 (例如 '淡江大學')
    // 且 link 是一個物件，則不直接開啟連結，因為父選單的點擊事件是為了展開子選單。
    if (typeof link === 'object' && link !== null) { 
        contentFrame.style.display = 'none';
        contentFrame.src = '';
        return; // 如果點擊的是父選單，則不執行後續的連結開啟操作
    }

    // 特殊處理：如果連結是淡江大學相關網站或 HackMD，則在新分頁開啟
    // 因為其網站設定不允許嵌入 iframe
    if (currentWork === '淡江大學官網' || currentWork === '教育科技學系官網') {
        window.open(link, '_blank'); // 在新分頁中開啟連結
        contentFrame.style.display = 'none'; // 隱藏 iframe
        contentFrame.src = ''; // 清空 iframe 的 src
        // 如果是從 iframe 狀態切換過來，需要確保背景動畫能顯示
        // 並且不要覆蓋「回到首頁」的行為
        if (currentWork !== '回到首頁' && currentWork !== '關閉作品') {
            currentWork = '關閉作品';
        }
    } else if (link) { // 檢查是否有對應的外部連結
        // 顯示 iframe
        contentFrame.src = link;
        contentFrame.style.display = 'block';
    } else { // 處理如「關閉作品」等沒有外部連結的項目
        // 隱藏 iframe，顯示動畫
        contentFrame.style.display = 'none';
        contentFrame.src = ''; 
    }
}

// 調整 iframe 尺寸的函式
function resizeIframe() {
    if (!contentFrame) return;

    const newWidth = windowWidth * iframeScale;
    const newHeight = windowHeight * iframeScale;

    contentFrame.style.width = newWidth + 'px';
    contentFrame.style.height = newHeight + 'px';
}

// --- p5.js Preload Function ---
function preload() {
  // 🌟 新增：預先載入圖片
  // 請確保在專案資料夾下有一個 'assets' 資料夾，
  // 並且裡面有一張名為 'profile.png' 的圖片。
  profileImage = loadImage('assets/profile.png');
}


// --- p5.js Setup Function ---
function setup() {
  createCanvas(displayWidth, displayHeight); 
  initializeDots();
  
  // 獲取 iframe 元素並調整尺寸
  contentFrame = document.getElementById('contentFrame');
  if (contentFrame) {
      resizeIframe(); 
  }
  
  // 創建漢堡圖示
  hamburger = createDiv(''); // 🌟 更新：賦值給全域變數
  hamburger.id('hamburger');
  hamburger.child(createDiv(''));
  hamburger.child(createDiv(''));
  hamburger.child(createDiv(''));
  hamburger.mousePressed(toggleMenu);

  // 創建選單容器
  menuContainer = createDiv();
  menuContainer.id('menu-container'); // 🌟 新增 ID 以便 CSS 選取
  
  // 創建按鈕並添加到容器中
  const menuItems = { ...externalLinks, '回到首頁': '#' };
  delete menuItems['作品筆記']; // 假設我們暫時不顯示這個

  for (const name in menuItems) {
    const link = menuItems[name];
    if (typeof link === 'object' && link !== null) {
      // 這是父選單
      const parentDiv = createDiv(name);
      parentDiv.addClass('parent-menu');
      const subMenu = createDiv('');
      subMenu.addClass('sub-menu');
      parentDiv.child(subMenu);
      menuContainer.child(parentDiv);

      for (const subName in link) {
        const subLink = link[subName];
        let subButton = createButton(subName);
        subButton.mousePressed(() => {
          changeWork(subName);
          toggleMenu();
        });
        subMenu.child(subButton);
      }
    } else {
      let button = createButton(name);
      button.mousePressed(() => {
        changeWork(name);
        toggleMenu();
      });
      menuContainer.child(button);
    }
  }
  
  // 確保初始狀態下 iframe 是隱藏的
  if (contentFrame) {
      contentFrame.style.display = 'none';
  }
}

// 漢堡選單開關功能
function toggleMenu() {
    menuContainer.toggleClass('open');
}

// --- p5.js Draw Function ---
function draw() {
  // --- 繪製點動畫 ---
  const currentStyle = styles[currentWork];
  
  // 1. 繪製背景
  fill(currentStyle.background);
  noStroke();
  rect(0, 0, width, height); 
  
  // 2. 設定點的顏色
  stroke(currentStyle.dotColor); 

  // 繪製點的動畫
  const m = createVector(mouseX, mouseY);
  for (let i = 0; i < numb; i++) {
    for (let j = 0; j < numb; j++) {
      dots[i][j].update(m);
    }
  }

  // 🌟 新增：在動畫中間添加文字
  if (currentWork === '關閉作品') {
      // 🌟 更新：處理文字動畫
      // --- 繪製雲朵對話框和文字 ---
      const bubbleW = 380;
      const bubbleH = 180;
      const bubbleX = width / 2 + 350; // 再次向右移動
      const bubbleY = height / 2 - 200 + textYOffset; // 再次向上移動並加上動畫位移

      // 檢查滑鼠是否在對話框上
      const isHovering = mouseX > bubbleX - bubbleW / 2 && mouseX < bubbleX + bubbleW / 2 &&
                         mouseY > bubbleY - bubbleH / 2 && mouseY < bubbleY + bubbleH / 2;

      // 如果滑鼠移入且動畫未播放，則觸發耳朵動畫
      if (isHovering && !isEarAnimating) {
          isEarAnimating = true;
          earAnimationStart = millis();
      }

      // 處理耳朵動畫
      if (isEarAnimating) {
          let elapsed = millis() - earAnimationStart;
          if (elapsed < earAnimationDuration) {
              let progress = elapsed / earAnimationDuration;
              earOffsetY = 20 * sin(progress * PI); // 模擬耳朵向下再彈回
          } else {
              isEarAnimating = false;
              earOffsetY = 0;
              if (!isHovering) earAnimationStart = 0; // 如果滑鼠已離開，重置以便下次觸發
          }
      }

      if (isTextAnimating) {
          let elapsed = millis() - textAnimationStart;
          if (elapsed < textAnimationDuration) {
              let progress = elapsed / textAnimationDuration;
              // 🌟 更新：使用帶有衰減效果的 sin 函數來模擬彈簧動畫
              const bounces = 2.5; // 彈跳次數
              const decay = 4.0;   // 衰減率
              textYOffset = -textJumpHeight * sin(progress * PI * bounces) * exp(-progress * decay);

              if (progress > 0.2 && !textChangedDuringAnimation) { // 提早更換文字
                  currentTextIndex = (currentTextIndex + 1) % interactiveTexts.length;
                  textChangedDuringAnimation = true;
              }
          } else {
              isTextAnimating = false;
              textYOffset = 0;
          }
      }

        // 繪製圖片
        if (profileImage) {
            const imgHeight = 300; // 放大圖片
            const imgWidth = imgHeight * (profileImage.width / profileImage.height);
            imageMode(CENTER);
            image(profileImage, width / 2, height / 2, imgWidth, imgHeight);
        }

        // 繪製雲朵
        fill(255, 255, 240, 230); // 帶透明度的奶油白
        stroke(200, 162, 200); // 薰衣草紫描邊
        strokeWeight(3);
        drawCatBubble(bubbleX, bubbleY, bubbleW, bubbleH, earOffsetY);

        // 在雲朵中繪製文字
        noStroke();
        fill(150, 112, 150); // 深一點的薰衣草紫
        textStyle(BOLD);
        textSize(24);
        textAlign(CENTER, CENTER);
        text(interactiveTexts[currentTextIndex], bubbleX, bubbleY - 10); // 微調Y軸讓文字置中

        // 繪製點擊提示文字
        const hintText = "(點擊對話框)";
        fill(180); // 灰色
        textSize(12);
        textStyle(NORMAL);
        text(hintText, bubbleX, bubbleY + 40);

        textStyle(NORMAL); // 重設文字樣式
  }
}
/**
 * 🌟 新增：繪製雲朵形狀的對話框
 * 🌟 更新：改為繪製貓咪頭形狀的對話框
 */
function drawCatBubble(x, y, w, h, earOffset) {
    const earHeight = h / 2;
    const earWidth = w / 4;
    const earYPos = y - h * 0.3; // 耳朵底部Y座標

    // --- 步驟 1: 繪製帶有完整輪廓的橢圓臉 ---
    stroke(200, 162, 200); // 薰衣草紫描邊
    strokeWeight(3);
    fill(255, 255, 240, 230); // 奶油白填充
    ellipse(x, y, w, h);

    // --- 步驟 2: 繪製耳朵的填充部分 (無描邊)，以覆蓋橢圓頂部的線條 ---
    noStroke();
    const leftEarX = x - w * 0.25;
    const rightEarX = x + w * 0.25;
    triangle(leftEarX - earWidth / 2, earYPos, leftEarX + earWidth / 2, earYPos, leftEarX, earYPos - earHeight + earOffset);
    triangle(rightEarX - earWidth / 2, earYPos, rightEarX + earWidth / 2, earYPos, rightEarX, earYPos - earHeight + earOffset);

    // --- 步驟 3: 只繪製耳朵外部的輪廓線 ---
    stroke(200, 162, 200); // 薰衣草紫描邊
    noFill();
    // 繪製耳朵的兩條外邊
    line(leftEarX - earWidth / 2, earYPos, leftEarX, earYPos - earHeight + earOffset);
    line(leftEarX, earYPos - earHeight + earOffset, leftEarX + earWidth / 2, earYPos);
    line(rightEarX - earWidth / 2, earYPos, rightEarX, earYPos - earHeight + earOffset);
    line(rightEarX, earYPos - earHeight + earOffset, rightEarX + earWidth / 2, earYPos);

    // --- 步驟 4: 繪製 S 形的貓尾巴輪廓 ---
    const tailStartX = x - w * 0.45; // 尾巴在橢圓上的起點 X
    const tailStartY = y + h * 0.22; // 尾巴在橢圓上的起點 Y
    const tailControl1X = x - w * 0.8; // 第一個控制點，向左下方拉
    const tailControl1Y = y + h * 0.8;
    const tailControl2X = x - w * 0.3; // 第二個控制點，向右上方拉
    const tailControl2Y = y + h * 1.1;
    const tailEndX = x - w * 0.6;      // 尾巴末端
    const tailEndY = y + h * 1.0;
    bezier(tailStartX, tailStartY, tailControl1X, tailControl1Y, tailControl2X, tailControl2Y, tailEndX, tailEndY);
}

/**
 * 🌟 新增：在每一幀中更新 UI 元素
 */
function updateUI() {
    // --- 1. 動態調整漢堡圖示顏色 ---
    const currentStyle = styles[currentWork];
    let bgColor = currentStyle.background;
    let hamburgerColor;

    // 判斷背景亮度
    let brightness = Array.isArray(bgColor) ? (bgColor[0] + bgColor[1] + bgColor[2]) / 3 : bgColor;
    
    // 如果背景偏暗，圖示設為白色，反之設為深灰色
    hamburgerColor = brightness < 128 ? 'white' : '#333';

    // 應用顏色到漢堡圖示的每一條線上
    const bars = hamburger.elt.getElementsByTagName('div');
    for (let bar of bars) {
        bar.style.backgroundColor = hamburgerColor;
    }

    // --- 2. 根據滑鼠位置觸發選單 ---
    if (mouseX < 50 && !menuContainer.hasClass('open')) {
        menuContainer.addClass('open');
    } else if (mouseX > 280 && menuContainer.hasClass('open')) { // 280px 約為選單寬度 + 一些緩衝
        menuContainer.removeClass('open');
    }
}


/**
 * 處理視窗大小改變
 */
function windowResized() {
  resizeCanvas(displayWidth, displayHeight);
  initializeDots();
  
  resizeIframe();
}

function mousePressed() {
    // 只在首頁時觸發文字點擊
    if (currentWork === '關閉作品' && !isTextAnimating) { 
        // 🌟 更新：檢查點擊是否在雲朵對話框的範圍內
        const bubbleW = 380;
        const bubbleH = 180;
        const bubbleX = width / 2 + 350;
        const bubbleY = height / 2 - 200; // 使用動畫前的原始Y值來偵測

        if (
            mouseX > bubbleX - bubbleW / 2 &&
            mouseX < bubbleX + bubbleW / 2 &&
            mouseY > bubbleY - bubbleH / 2 &&
            mouseY < bubbleY + bubbleH / 2
        ) {
            // 啟動動畫
            isTextAnimating = true;
            textAnimationStart = millis();
            textChangedDuringAnimation = false;
        }
    }
}

// 🌟 更新：在 p5.js 的 draw 函式結尾呼叫 UI 更新
const originalDraw = draw;
draw = function() {
    originalDraw();
    updateUI();
}