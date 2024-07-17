* 目標
  * 除了對全域廣播訊息，新增悄悄話功能
  * 用戶離開聊天室，其他在線的用戶會收到訊息
* 學習
  * 使用innerHTML += `要增加的內容`，顯示要在chatroom顯示的所有訊息
  * 也有使用createElement(新增節點)的方式呈現
  * 設置 scrollToBottom() 的function，確保最新訊息會一直呈現在用戶聊天室的可視區域
    * scrollTop、scrollHeight、clientHeight 三者的關係
* 途中卡點
  * 在註冊rightArea(用戶列表)的所有用戶按紐時，註冊程式碼放在message事件底下，造成重複註冊，引發bug
  * 將廣播、悄悄話訊息呈現在畫面時，在使用innerHTML或append節點的方式時，操作不熟悉，花了很多時間
