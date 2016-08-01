/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

var aqiBaseData = 500;//aqi基数，应该是一个常量

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: -1,
  nowGraTime: "day"
}

/**
 * 渲染图表
 */
function renderChart() {
  var aqiChartWrap = document.getElementById("aqi-chart-wrap");
  var bars = aqiChartWrap.getElementsByTagName("div");
  var nowSelectCityName = Object.keys(aqiSourceData)[pageState.nowSelectCity];
  
  //先清除上一个城市的图表
  UtilJS.DOMUtil.removeTagsInAncestor(aqiChartWrap, "div");

  //分day、week和month三种渲染
  var currentGraTime = chartData.day;

  switch(pageState.nowGraTime){
    case "day": currentGraTime = chartData.day;
    break;
    case "week": currentGraTime = chartData.week;
    break;
    case "month": currentGraTime = chartData.month;
    break;
  }

  for(var date in currentGraTime[nowSelectCityName]){
    var bar = document.createElement("div");
    var scale = currentGraTime[nowSelectCityName][date] / aqiBaseData * 100;

    bar.title = date + "\n[AQI] : " + currentGraTime[nowSelectCityName][date];
    bar.style.height = scale + "%";

    /*空气质量分级*/
    if(scale <= 20){
      bar.className = "aqi_bar_green";
    }
    else if(scale <= 40){
      bar.className = "aqi_bar_blue";
    }
    else if(scale <= 60){
      bar.className = "aqi_bar_red";
    }
    else if(scale <= 80){
      bar.className = "aqi_bar_purple";
    }
    else if(scale <= 100){
      bar.className = "aqi_bar_black";
    }

    aqiChartWrap.appendChild(bar);
  }
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(event) {
  // 确定是否选项发生了变化
  if(event.target.value === pageState.nowGraTime)
    return;

  // 设置对应数据
  pageState.nowGraTime = event.target.value;

  // 调用图表渲染函数
  renderChart();
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
  // 确定是否选项发生了变化
  var currentSelectVal = document.getElementById("city-select").value;
  if(pageState.nowSelectCity === currentSelectVal)
    return;

  // 设置对应数据
  pageState.nowSelectCity = currentSelectVal;

  // 调用图表渲染函数
  renderChart();
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  var radioDay = document.getElementById("radio_day");
  var radioWeek = document.getElementById("radio_week");
  var radioMonth = document.getElementById("radio_month");

  UtilJS.EventUtil.addBubblingHandler(radioDay, "click", graTimeChange);
  UtilJS.EventUtil.addBubblingHandler(radioWeek, "click", graTimeChange);
  UtilJS.EventUtil.addBubblingHandler(radioMonth, "click", graTimeChange);
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 设置id为city-select的下拉列表中的选项
  var citySelect = document.getElementById("city-select");
  var count = 0;

  for(var aqiCityName in aqiSourceData){
    var option = document.createElement("option");
    option.value = count++;
    option.innerText = aqiCityName;
    citySelect.appendChild(option);
  }

  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  UtilJS.EventUtil.addBubblingHandler(citySelect, "change", citySelectChange);

  //初始化当前选择的城市：即aqiSourceData第一个属性
  pageState.nowSelectCity = 0;

  //初始化当前的日期粒度
  var radioDay = document.getElementById("radio_day");
  radioDay.checked = "checked";
  pageState.nowGraTime = "day";
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式，如周和月需要计算，最后保存到chartData中
  var week = {}, count = 0, singleWeek = {},
      month = {}, mcount = 0, singleMonth = {};

  for (var key in aqiSourceData) {
      var tempCity = aqiSourceData[key]
      var keyArr = Object.getOwnPropertyNames(tempCity);
      var tempMonth = keyArr[0].slice(5, 7);
      var weekInit = 4, weekCount = 0;
      for (var i = 0; i < keyArr.length; i++, weekInit++) {
          count += tempCity[keyArr[i]];
          mcount += tempCity[keyArr[i]];
          weekCount++;
          if ((weekInit+1) % 7 == 0 || i == keyArr.length - 1 || keyArr[i+1].slice(5, 7) !== tempMonth) {
              var tempKey = keyArr[i].slice(0, 7) + "月第" + (Math.floor(weekInit / 7) + 1) + "周";
              singleWeek[tempKey] = Math.floor(count / weekCount);

              if (i != keyArr.length - 1 && keyArr[i+1].slice(5, 7) !== tempMonth) {
                  weekInit = weekCount % 7;
              }
              count = 0;
              weekCount = 0;

              if (i == keyArr.length - 1 || keyArr[i+1].slice(5, 7) !== tempMonth) {
                  tempMonth = (i == keyArr.length - 1) ? keyArr[i].slice(5, 7) : keyArr[i+1].slice(5, 7);
                  var tempMKey = keyArr[i].slice(0, 7);
                  var tempDays = keyArr[i].slice(-2);
                  singleMonth[tempMKey] = Math.floor(mcount / tempDays);
                  mcount = 0;
              }
          }
      }
      week[key] = singleWeek;
      month[key] = singleMonth;
      singleWeek = {};
      singleMonth = {};
  }
  // 处理好的数据存到 chartData 中
  chartData.day = aqiSourceData;
  chartData.week = week;
  chartData.month = month;
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm();
  initCitySelector();
  initAqiChartData();
  renderChart();
}

UtilJS.EventUtil.addBubblingHandler(window, "load", init);
