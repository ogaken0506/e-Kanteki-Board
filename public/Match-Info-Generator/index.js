// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
  cloneCategoryTemplate();
  
  // 「追加」ボタンで新しい部門を追加
  document.querySelector('#add-category-button').addEventListener('click', () => {
    cloneCategoryTemplate();
  });
  
  // 「生成」ボタンでダウンロード
  document.querySelector('#generate-button').addEventListener('click', (e) => {
    e.preventDefault();
    downloadJSON();
  });
});

// category-templateの内容をcategoriesに複製する関数
function cloneCategoryTemplate() {
  const template = document.getElementById('category-template');
  const categoriesContainer = document.getElementById('categories');
  if(!template || !categoriesContainer){
    console.error('#category-templateまたは#categoriesが見つかりません。');
    return
  };
  
  // templateタグの内容をクローン
  const clone = template.content.cloneNode(true);
  if(!(clone instanceof DocumentFragment))return;

  //input[type="radio"]のnameにUUIDを格納
  // テンプレート内のラジオボタン群にユニークな name を付与する
  const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2);
  clone.querySelectorAll('.match_type_input').forEach((inputElem) => {
    inputElem.name = `match_type_${uuid}`;
  });

  //複製した閉じるボタンにイベントリスナーを追加
  clone.querySelectorAll('#left-close-button, #right-close-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryWrapper = button.closest('.category-wrapper');
      if (categoryWrapper) {
        categoryWrapper.remove();
        updateCategoryNumbers();
      }
    });
  });

  // categoriesにクローンを追加
  categoriesContainer.appendChild(clone);

  // 全てのcategory-numberを更新
  updateCategoryNumbers();
}

// category-numberに連番を付与する関数
function updateCategoryNumbers() {
  const categoryWrappers = document.querySelectorAll('.category-wrapper');
  categoryWrappers.forEach((wrapper, index) => {
    const categoryNumber = wrapper.querySelector('.category-number');
    categoryNumber.textContent = index + 1;
  });
}

// フォーム内容をJSONに変換する関数
function gatherFormData() {
  const data = {
    categories: [],
    venue: {
      shajo_count: parseInt(document.getElementById('shajo-count-input').value) || 0
    }
  };

  // 各カテゴリの情報を収集
  document.querySelectorAll('.category-wrapper').forEach((wrapper) => {
    const category = {};
    
    // data-key属性を持つインプットから値を取得
    wrapper.querySelectorAll('[data-key]').forEach(input => {
      const key = input.getAttribute('data-key');
      let value = input.value;
      
      // 数値型に変換
      if (input.type === 'number') {
        value = parseInt(value) || 0;
      }
      //URLの場合はID抽出
      if (key == 'sheet_id'){
        value = extractSheetId(value)
      }
      
      category[key] = value;
    });
    
    // ラジオボタンから試合形式を取得
    const matchType = wrapper.querySelector('input[class="match_type_input"]:checked');
    if (matchType) {
      category.match_type = matchType.value;
    }
    
    data.categories.push(category);
  });

  return data;
}

// JSONをダウンロードする関数
function downloadJSON() {
  const data = gatherFormData();
  const json = JSON.stringify(data, null, 2);
  
  // Blobを作成
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // リンク要素を作成してダウンロード
  const a = document.createElement('a');
  a.href = url;
  a.download = `match-info-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

//GoogleスプレッドシートのURLからシートのIDを抽出
function extractSheetId(argStr){
  if(typeof argStr == 'string'){
    if(argStr.match(/\/spreadsheets\/d\//)){
      argStr = argStr.replace(/.*\/spreadsheets\/d\//,"")
      argStr = argStr.replace(/\/.*/,"")
    }
  }
  return argStr;
}