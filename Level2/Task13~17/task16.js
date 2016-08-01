/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
    var aqiCityName = document.getElementById("aqi-city-input").value.trim();
    var aqiValue = document.getElementById("aqi-value-input").value.trim();

    try{
        if(!UtilJS.isLegalStr(aqiCityName, "wc", 8)){
            alert("城市名称必须为八个字符以内的中英文字符！");
            return;
        }
    }
    catch(error){
        if(error instanceof UtilJS.InvalidArgumentError && error.code === 0){
            alert("城市名称不能为空！");
            return;
        }
    }

    try{
        if(!UtilJS.isLegalStr(aqiValue, "n", 8)){
            alert("空气质量指数必须为首字不为0且八个字符以内的数字！");
            return;
        }
    }
    catch(error){
        if(error instanceof UtilJS.InvalidArgumentError && error.code === 0){
            alert("空气质量指数不能为空！");
            return;
        }
    }

    aqiData[aqiCityName] = aqiValue;
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
    var aqiTable = document.getElementById("aqi-table");
    var aqiListHTML = "<tr><td>城市</td><td>空气质量</td><td>操作</td></tr>";

    for(var aqiCityName in aqiData){
        aqiListHTML += "<tr><td>"+ aqiCityName + "</td><td>"+
                        aqiData[aqiCityName] + "</td><td><button onclick='delBtnHandle(\"" +
                        aqiCityName + "\")'>删除</button></td></tr>";
    }
    aqiTable.innerHTML = aqiCityName ? aqiListHTML : "";//aqiData必须有内容
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
    addAqiData();
    renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(aqiCityName) {
    delete aqiData[aqiCityName];
    renderAqiList();
}

function init() {
    // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
    var addBtn = document.getElementById("add-btn");
    UtilJS.EventUtil.addBubblingHandler(addBtn, "click", addBtnHandle);
}

UtilJS.EventUtil.addBubblingHandler(window, "load", init);