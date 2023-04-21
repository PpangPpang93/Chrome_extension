// init
// 변수 선언
var imgSize = 256;
var imgStyleArr = [];
var reversedImgStyleArr = []; // 추상적, 현실적 등 정보 저장 list
var imgUrls = []; // 전체 이미지 url
var tempUrls = []; // 생성시 url
const imgSizeElem = {256:0, 512:1, 1024:2};
const imgStyleElem = {
  'realistic':0, 'painting':1, 'abstract':2, 
  'fantasy':3, 'anime':4, 'futuristic':5, 
  'vintage':6, 'colorful':7, 'gray':8
  };
const reversedImgStyleElem = {
  'realistic': 'very realistic', 'painting': 'Digital painting', 'abstract': 'abstract',
  'fantasy': 'fantasy', 'anime': '2d digital vector art', 'futuristic': 'futuristic',
  'vintage': '1800s', 'colorful': 'colorful', 'gray': 'gray-scale'
  };

// config 정보 API Key, chat gpt, dalle api
const apiKey = 'SET_YOUR_OPENAI_API_KEY'; // test api
const chatUrl = "https://api.openai.com/v1/chat/completions";
const dalleUrl = 'https://api.openai.com/v1/images/generations';


// load storage info
async function loadImgSize() {
  savedimgSize = await chrome.storage.local.get(['imgSize']);
  imgSize = savedimgSize.imgSize;
  return imgSize;
};

async function loadImgStyle() {
  savedimgStyleArr = await chrome.storage.local.get(['imgStyleArr']);
  imgStyleArr = savedimgStyleArr.imgStyleArr;
  return imgStyleArr;
};

async function loadreversedImgStyleArr() {
  savedreversedImgStyleArr = await chrome.storage.local.get(['reversedImgStyleArr']);
  reversedImgStyleArr = savedreversedImgStyleArr.reversedImgStyleArr;
  return reversedImgStyleArr;
};

async function loadText() {
  savedText = await chrome.storage.local.get(['text']);
  text = savedText.text;
  return text;
};

async function loadImgUrls() {
  savedImgUrls = await chrome.storage.local.get(['imgUrls']);
  imgUrls = savedImgUrls.imgUrls;
  return imgUrls;
};

//load Image Size
loadImgSize().then(results => {
  if (results != null){
    for (var i=0; i < document.img_size_option.elements.length; i++) {
      document.img_size_option.elements[i].checked = false;
    }
    document.img_size_option.elements[imgSizeElem[results]].checked = true;
  } else{imgSize = 256;}
});


//load Image Style
loadImgStyle().then(results => {
  if (results != null){
    for (var i in results) {
      document.img_style_option.elements[imgStyleElem[results[i]]].checked = true;
    }
  } else {imgStyleArr = [];}
});

// reversed Image Style
loadreversedImgStyleArr().then(results => {
  if (results == null){reversedImgStyleArr = [];}
});


// text => 저장된 값 content에 표시
loadText().then(results => {
  if (results != null){
    document.getElementById('prompt_box').innerHTML = results;
  }
});

// 이미지, 버튼 => 저장된 값 있으면 표시
loadImgUrls().then(results => {
  if (results != null){
    const display = document.getElementById('img_display');
    if(display != null){
      display.innerHTML="";
    }
    showImg(results);
    makeReGenerateBtn();
  } else {
    imgUrls = [];
  }
});


// activate part
// imgSize
document.getElementById('chk_img256').addEventListener('click', setImgSize);
document.getElementById('chk_img512').addEventListener('click', setImgSize);
document.getElementById('chk_img1024').addEventListener('click', setImgSize);
function setImgSize(event) {
  imgSize = parseFloat(event.target.value);
  if (event.target.checked === true){
      for (var i=0; i < document.img_size_option.elements.length; i++) {
        document.img_size_option.elements[i].checked = false;
      }
      document.img_size_option.elements[imgSizeElem[imgSize]].checked = true;  

      //storage
      chrome.storage.local.set({'imgSize' : imgSize});
      return;
  }
  if (event.target.checked === false){
    for (var i=0; i < document.img_size_option.elements.length; i++) 
      document.img_size_option.elements[i].checked = false;
    document.img_size_option.elements[0].checked = true;  //default = 256
    imgSize = 256; 

    //storage
    chrome.storage.local.set({'imgSize' : imgSize});
    return;
  }
};


// img_style
document.getElementById('chk_realistic').addEventListener('click', setImgStyle);
document.getElementById('chk_painting').addEventListener('click', setImgStyle);
document.getElementById('chk_abstract').addEventListener('click', setImgStyle);
document.getElementById('chk_fantasy').addEventListener('click', setImgStyle);
document.getElementById('chk_anime').addEventListener('click', setImgStyle);
document.getElementById('chk_futuristic').addEventListener('click', setImgStyle);
document.getElementById('chk_vintage').addEventListener('click', setImgStyle);
document.getElementById('chk_colorful').addEventListener('click', setImgStyle);
document.getElementById('chk_gray').addEventListener('click', setImgStyle);

function setImgStyle(event){
  const style = event.target.value;
  console.log(imgStyleArr.imgStyleArr);

  // checked true인 경우 : array가 3이상인 경우 alert, array가 3보다 작은 경우 array에 추가
  if (event.target.checked === true){
    // array가 3이상인 경우 alert
    if (imgStyleArr.length === 3){
      document.img_style_option.elements[imgStyleElem[style]].checked = false;
      alert('Image Style은 3개만 선택 가능합니다.')
    } else {
      imgStyleArr.push(event.target.value);
      reversedImgStyleArr.push(reversedImgStyleElem[style]);
    }
    // console.log('array : ' + imgStyleArr);
    // `console.log('`reversedImgStyleArr : ' + reversedImgStyleArr);
    chrome.storage.local.set({'imgStyleArr' : imgStyleArr});
    chrome.storage.local.set({'reversedImgStyleArr' : reversedImgStyleArr});
    return;
  }
  // checked false인 경우 : array에서 제거 + checked false로 변환
  if (event.target.checked === false){
    document.img_style_option.elements[imgStyleElem[style]].checked = false;
    imgStyleArr = imgStyleArr.filter(function(item){
      return item !== style;
    })
    // console.log('array : ' + imgStyleArr);
    reversedImgStyleArr = reversedImgStyleArr.filter(function(item){
      return item !== reversedImgStyleElem[style];
    })
    // console.log('array : ' + reversedImgStyleArr);
    chrome.storage.local.set({'imgStyleArr' : imgStyleArr});
    chrome.storage.local.set({'reversedImgStyleArr' : reversedImgStyleArr});
    return;
  }
};

// text controller
document.addEventListener('DOMContentLoaded', checkText);
function checkText(){
  const text = document.getElementById('prompt_box');
  const textCnt = document.getElementById('text_cnt');

  text.addEventListener('keyup', function() {
    textCnt.innerHTML = "(" + this.value.length + " / 300)";
    if (this.value.length > 300) {
      this.value = this.value.substring(0, 300);
      textCnt.innerHTML = "(300 / 300)";
      alert('글자 수는 300자까지 입력이 가능합니다.');
    }
  chrome.storage.local.set({'text' : text.value});
  });
};


// generate
document.getElementById('btn_generate_img').addEventListener('click', generate);
document.getElementById('btn_re_generate_img').addEventListener('click', generate);
function generate() {
  showSpinner();  // spinner activate

  var text = document.getElementById('prompt_box').value;
  console.log('imgSize : ' + imgSize);
  console.log('array : ' + imgStyleArr);
  console.log('reversedImgStyleArr : ' + reversedImgStyleArr);
  console.log('text : ' + text);

  // chat gpt input prompt config
  const messages = [{'role': 'system',
                      'content': 'You are an assistant who is good at creating prompts for image creation.'},
                    {'role': 'assistant',
                    'content': text},
                    {'role': 'user',
                    'content': 'Condense up to 4 outward description to focus on nouns and adjectives separated by ,'}]
  const chatInfo = {
      model: 'gpt-3.5-turbo',
      messages: messages,
  };

  async function fetchData() {
    let chatConfigSet = set_config(chatInfo)
    try {
        // get description from chat-gpt
        const chatResponse = await fetch(chatUrl, chatConfigSet);
        const chatData = await chatResponse.json();
        const processedStr = chatData.choices[0].message.content;

        // dalle input prompt config
        const dalleInfo = {
          "model": "image-alpha-001",
          "prompt": processedStr + ', ' + reversedImgStyleArr,
          "num_images": 4,
          "size": `${imgSize}x${imgSize}`,
          "response_format": "url"
        };

        let dalleConfigSet = set_config(dalleInfo);

        console.log(dalleConfigSet, dalleUrl);
        const dalleResponse = await fetch(dalleUrl, dalleConfigSet);
        const dalleData = await dalleResponse.json();
        const url_result = dalleData['data'];
        return url_result;
    } catch (error) {
        console.error(error);
    }
  };


  // 이미지 링크 출력
  fetchData()
  .then(results => {
    for (var i=0;i<4;i++){
      tempUrls.push(results[i]['url']);
      imgUrls.push(results[i]['url']);
    }
    showImg(imgUrls);
    makeReGenerateBtn();
    tempUrls = [];
    chrome.storage.local.set({'imgUrls' : imgUrls});
    hideSpinner();
  })
  .catch(error => {
    hideSpinner();
    alert('다시 한 번 시도해 주세요 error : '+error);
  });
};

// api config 변경
function set_config(data){
  const config = {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };
  return config;
};

// img 표시
function showImg(imgUrls){
  const display = document.getElementById('img_display');
  var string = '';
  // display-img div에 아래 항목을 추가
  for (let i=0; i < imgUrls.length; i++) {
    string += '<div><img src="' + imgUrls[i] 
          + '" id = "generated_img_' + i 
          + '" style="width: 150px; height: auto;"></div>'
  display.innerHTML = string;
  }
};


function makeReGenerateBtn(){
  /// 버튼 생성할 div 선택
  const reGenrateBtn = document.getElementById('btn_re_generate_img');
  /// 추가할 버튼 요소에 대해 정의
  const newBtn = document.createElement('button');
  newBtn.className = "btn btn-default btn-submit-size";
  newBtn.id = "btn_re_generate";
  newBtn.innerHTML = 'WANT MORE !!!';
  /// 생성되어 있던 버튼이 있는 경우 해당 id를 기준으로 삭제
  const oldBtn = document.getElementById("btn_re_generate_img")
  if(oldBtn != null){
    oldBtn.innerHTML="";
  }
  /// 버튼 생성
  reGenrateBtn.appendChild(newBtn);
};


function showSpinner() {
  document.getElementsByClassName('layerPopup')[0].style.display='block';
}

function hideSpinner() {
  document.getElementsByClassName('layerPopup')[0].style.display='none';
}


// trash_icon
document.getElementById('trash_icon').addEventListener('click', eraseAll);
function eraseAll() {
  imgSize = 256;
  imgStyleArr = [];
  imgUrls = [];
  tempUrls = [];
  reversedImgStyleArr = [];
  for (var i=0; i < document.img_size_option.elements.length; i++) 
    document.img_size_option.elements[i].checked = false;
  for (var i=0; i < document.img_style_option.elements.length; i++) 
    document.img_style_option.elements[i].checked = false; 
  document.querySelector('#prompt_box').value = '';
  document.img_size_option.elements[0].checked = true;

  const display = document.getElementById('img_display');
  console.log(display);
  if(display != null){
    display.innerHTML="";
  }
  
  const oldBtn = document.getElementById("btn_re_generate_img")
  if(oldBtn != null){
    oldBtn.innerHTML="";
  }
  //storage 비우기
  chrome.storage.local.clear();
};
