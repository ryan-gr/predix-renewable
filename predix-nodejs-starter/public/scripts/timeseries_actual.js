const loadData = () => {
  console.log(nowEpoch());
  console.log(beforeEpoch());
  console.log('trying to get data with above range.');
  getDataWithRange(beforeEpoch(), nowEpoch());
  console.log('END');
}

window.onload = () => {
  loadData();
}

//const nowEpoch = () => (new Date()).getTime();

const nowEpoch = () => 1534291200000;
const beforeEpoch = () => 1532995200000;

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
      console.log(data);
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
              'y0': measurement,
              });
          }
          if (i == vals.length - 1 || i == vals.length - 2) {
            if (recordTime) analyticsData.time.push(time);
            analyticsData[name].push(measurement);
          }
        }
        recordTime = false;
      }
      console.log('analyticsData', JSON.stringify(analyticsData));
      console.log('graphData', graphData);

      document.querySelector('px-vis-timeseries').setAttribute('chart-data', JSON.stringify(graphData));

      console.log('querying analytics');
      getPredictedValue(analyticsData);

		}
	};
	timeSeriesGetData.onerror = function() {
		console.log('Error getting data for tags');
	};
  //console.log('sending', JSON.stringify(myTimeSeriesBody));
  timeSeriesGetData.send(JSON.stringify(myTimeSeriesBody));
}

const getPredictedValue = (data) => {
	const analyticsRequest = new XMLHttpRequest();
  //TODO: move the query to a local route to hide the zone-id?
	analyticsRequest.open('POST', '/predix-api/predix-analytics-framework/api/v1/catalog/analytics/5a6391ad-6967-4dcd-bbd5-ca54bbcc89b0/execution', true);

	analyticsRequest.onload = function() {
		if (analyticsRequest.status >= 200 && analyticsRequest.status < 400) {
			const data = JSON.parse(analyticsRequest.responseText);
			//const str = JSON.stringify(timeSeriesGetData.responseText, null, 2);
      console.log('received', data);
		}
	};
	analyticsRequest.onerror = function() {
		console.log('Error in getting analytics');
	};
  //console.log('sending', JSON.stringify(myTimeSeriesBody));
  analyticsRequest.send(JSON.stringify(data));
}
