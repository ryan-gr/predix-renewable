const loadData = () => {
  console.log(nowEpoch());
  console.log(beforeEpoch());
  console.log('trying to get data with above range.');
  getDataWithRange(beforeEpoch(), nowEpoch());
  console.log('END');
}

window.onload = () => {
  loadData();
  document.querySelector('px-data-grid').addEventListener('item-action', (e) => {
    console.log('selected action', e);
    const action = e.detail.action;
    const farmId = e.detail.item.farmId;
    const turbineId = e.detail.item.turbineId;
    if (action == 'dashboard') {
      const nav = document.querySelector('px-app-nav');
      nav.selectedRoute = ['home'];
    }
    if (action == 'mark') {
      const data = document.querySelector('px-data-grid').tableData;
      console.log(data);
      for (const i in data) {
        if (data[i].turbineId == turbineId) {
          data[i].status = (data[i].status == 'Maintenance') ? 'Running' : 'Maintenance';
          break;
        }
      }
      document.querySelector('px-data-grid').updateColumns();
    }

  });
  document.querySelector('px-app-nav').addEventListener('selected-changed', (e) => {
    console.log('selected changed!', e.detail.value.id);
    goto(e.detail.value.id);
  });
}

window.onkeypress = (e) => {
  //console.log(e.keyCode);
  if (e.keyCode == 61) nextHour();
  if (e.keyCode == 45) previousHour();
  if (e.keyCode == 48) nextDay();
  if (e.keyCode == 57) previousDay();
}

const goto = (id) => {
  if (id == 'select') {
    document.querySelector('.main-container').style.opacity = 0;
    document.querySelector('.select-container').style.display = 'block';
    setTimeout(() => {
      document.querySelector('.main-container').style.display = 'none';
      document.querySelector('.select-container').style.opacity = 1;
    }, 300);
  }
  if (id == 'home') {
    document.querySelector('.select-container').style.opacity = 0;
    document.querySelector('.main-container').style.display = 'flex';
    setTimeout(() => {
      document.querySelector('.select-container').style.display = 'none';
      document.querySelector('.main-container').style.opacity = 1;
    }, 300);
  }
}

const getPowerFromWindspeed = (ws) => {
  const d = {3: 25.00, 4:171.00, 5:389.00, 6:704.00, 7:1136.00,
    8:1674.00, 9: 2160.00, 10:2416.00, 11:2514.00, 12:2530.00}
  if (ws > 12) return d[12];
  if (ws < 3) return 0;
  if (ws in d) return d[ws];
  const lower = Math.floor(ws);
  const higher = Math.ceil(ws);
  return d[lower] + (d[higher] - d[lower]) * (ws - lower);
}

const startLoading = () => {
  document.querySelector('#loading').style.display = 'block';
  document.querySelector('#loading-div').style.display = 'block';
  document.querySelector('#loading').style.opacity = 1;
  document.querySelector('#loading-div').style.opacity = 1;
}
const endLoading = () => {
  document.querySelector('#loading').style.opacity = 0;
  document.querySelector('#loading-div').style.opacity = 0;
  setTimeout(() => {
    document.querySelector('#loading').style.display = 'none';
    document.querySelector('#loading-div').style.display = 'none';
  }, 300);
}

const updateCurrentTimeStamp = (epoch) => {

  const d = new Date(epoch);
  console.log('updating with', epoch, d);
  const ds = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear() + " " + ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2);
  document.querySelector('#current-time-text').setAttribute('label', ds);
  updatePredictedTimeStamp(epoch + 3600000 * 2);
}

const updatePredictedTimeStamp = (epoch) => {
  const d = new Date(epoch);
  const ds = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear() + " " + ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2);
  document.querySelector('#predicted-time-text').setAttribute('label', ds);
}

let _nowEpoch = 1534291200000;
const nextDay = () => modifyEpoch(86400000);
const previousDay = () => modifyEpoch(-86400000);
const nextHour = () => modifyEpoch(3600000);
const previousHour = () => modifyEpoch(-3600000);
const modifyEpoch = (del) => {
  _nowEpoch += del;
  console.log('new epoch', _nowEpoch, new Date(_nowEpoch));
  getDataWithRange(beforeEpoch(), nowEpoch());
}
const nowEpoch = () => _nowEpoch;
const resetNowEpoch = () => _nowEpoch = 1534291200000;
const beforeEpoch = () => 1533081600000;//_nowEpoch - 86400000;

const getDataWithRange = (epochStart, epochEnd) => {
  const myTimeSeriesBody = {
		tags: [],
    start: epochStart,
    end: epochEnd
	};
	const timeSeriesGetData = new XMLHttpRequest();
	timeSeriesGetData.open('POST', '/predix-api/predix-timeseries/v1/datapoints', true);

	const tags = [
    'wind_speed_a',
    'temperature_a',
    'moving_ave_a',
    'moving_ave_b',
    'rate_of_change_a',
    'rate_of_change_b',
    'rate_of_change_c',
    'target_variable_a',
  ];

	for (const tag of tags) {
		myTimeSeriesBody.tags.push({
			"name" : tag,
		});
	}

	timeSeriesGetData.onload = function() {
		if (timeSeriesGetData.status >= 200 && timeSeriesGetData.status < 400) {
			const data = JSON.parse(timeSeriesGetData.responseText);
			//const str = JSON.stringify(timeSeriesGetData.responseText, null, 2);
      const analyticsData = {time: []};
      const graphData = [];
      let recordTime = true;
      console.log('data', data);
      for (const tag of data.tags) {
        const name = tag.name;
        const vals = tag.results[0].values;
        analyticsData[name] = [];
        for (const i in vals) {
          const time = vals[i][0];
          const measurement = vals[i][1];
          if (name == 'wind_speed_a') {
            graphData.push({
              'timeStamp': time,
              'y0': measurement/10,
            });
          }
          if (name == 'moving_ave_a') {
            graphData[i]['y1'] = measurement/10;
          }
          if (i == vals.length - 1 || i == vals.length - 2) {
            if (recordTime) analyticsData.time.push(time);
            analyticsData[name].push(measurement);
          }
        }
        recordTime = false;
      }
      //console.log('analyticsData', JSON.stringify(analyticsData));
      //console.log('graphData', graphData);

      const latestTime = analyticsData.time[analyticsData.time.length - 1];
      const latestWindSpeed = analyticsData.wind_speed_a[analyticsData.wind_speed_a.length - 1] / 10;
      const latestTemperature = analyticsData.temperature_a[analyticsData.temperature_a.length - 1] / 10;
      console.log('latestTime', latestTime);
      console.log('latestWindSpeed', latestWindSpeed);
      console.log('latestTemperature', latestTemperature);
      updateCurrentTimeStamp(latestTime);
      document.querySelector('#wind-speed-text').setAttribute('value', latestWindSpeed);
      document.querySelector('#power-output-text').setAttribute('value', getPowerFromWindspeed(latestWindSpeed));
      document.querySelector('#temperature-text').setAttribute('value', latestTemperature);
      document.querySelector('px-vis-timeseries').setAttribute('chart-data', JSON.stringify(graphData));
      console.log('querying analytics');
      getPredictedValue(analyticsData, graphData);

		}
	};
	timeSeriesGetData.onerror = function() {
		console.log('Error getting data for tags');
	};
  //console.log('sending', JSON.stringify(myTimeSeriesBody));
  startLoading();
  timeSeriesGetData.send(JSON.stringify(myTimeSeriesBody));
}

const getPredictedValue = (data, graphData) => {
	const analyticsRequest = new XMLHttpRequest();
  //TODO: move the query to a local route to hide the zone-id?
	analyticsRequest.open('POST', '/predix-api/predix-analytics-framework/api/v1/catalog/analytics/5a6391ad-6967-4dcd-bbd5-ca54bbcc89b0/execution', true);

	analyticsRequest.onload = function() {
		if (analyticsRequest.status >= 200 && analyticsRequest.status < 400) {
			const data = JSON.parse(analyticsRequest.responseText);
			//const str = JSON.stringify(timeSeriesGetData.responseText, null, 2);
      //console.log('received', data);
      if (data.status != 'COMPLETED') {
        console.log('Error in getting analytics!');
        return;
      }
      const predictedValue = JSON.parse(data.result).Prediction;
      console.log('predicted value', predictedValue);
      document.querySelector('#predicted-wind-speed-text').setAttribute('value', parseInt(predictedValue)/10);
      document.querySelector('#predicted-power-output-text').setAttribute('value', getPowerFromWindspeed(parseInt(predictedValue)/10));
      const latestTime = graphData[graphData.length - 1].timeStamp;
      graphData[graphData.length] = {timeStamp: latestTime + 3600000 * 2, y0:parseInt(predictedValue)/10};
      console.log(graphData);
      document.querySelector('px-vis-timeseries').setAttribute('chart-data', JSON.stringify(graphData));
      endLoading();
		}
	};
	analyticsRequest.onerror = function() {
		console.log('Error in getting analytics');
	};
  //console.log('sending', JSON.stringify(myTimeSeriesBody));
  analyticsRequest.send(JSON.stringify(data));
}
