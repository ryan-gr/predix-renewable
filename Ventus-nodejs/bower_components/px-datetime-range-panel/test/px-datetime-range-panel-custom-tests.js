suite('Calendars base dates', function() {
  let rangePanel, fromCal, toCal;

  //reset from base dates for every tests
  setup(function(done) {
    rangePanel = fixture('range_panel');
    fromCal = Polymer.dom(rangePanel.root).querySelectorAll('px-calendar-picker')[0];
    toCal = Polymer.dom(rangePanel.root).querySelectorAll('px-calendar-picker')[1];

    rangePanel.fromBaseDate = Px.moment("2016-06-01T20:00:00Z");
    rangePanel.toBaseDate = Px.moment("2016-07-11T22:00:00Z");

    flush(function() {
      done();
    });
  });

  test('by default month follow', function() {
    assert.equal(rangePanel.toBaseDate.diff(rangePanel.fromBaseDate, 'month'), 1);
  });

  test('middle arrows not shown when month consecutive', function() {
    var fromCalendar = Polymer.dom(rangePanel.root).querySelector('#fromCalendar');
    var toCalendar = Polymer.dom(rangePanel.root).querySelector('#toCalendar');
    assert.isFalse(fromCalendar.hidePreviousButton);
    assert.isTrue(fromCalendar.hideNextButton);
    assert.isTrue(toCalendar.hidePreviousButton);
    assert.isFalse(toCalendar.hideNextButton);
  });

  test('all arrows shown when month not consecutive', function(done) {

    rangePanel.toBaseDate = Px.moment("2016-08-11T22:00:00Z");

    flush(function() {
      var fromCalendar = Polymer.dom(rangePanel.root).querySelector('#fromCalendar');
      var toCalendar = Polymer.dom(rangePanel.root).querySelector('#toCalendar');
      assert.isFalse(fromCalendar.hidePreviousButton);
      assert.isFalse(fromCalendar.hideNextButton);
      assert.isFalse(toCalendar.hidePreviousButton);
      assert.isFalse(toCalendar.hideNextButton);
      done();
    });
  });

  test('next arrow does not change toMoment', function(done) {

    rangePanel.fromMoment = Px.moment("2016-06-01T20:00:00Z");
    rangePanel.toMoment = Px.moment("2016-07-11T22:00:00Z");

    flush(function() {
      var toCalendar = Polymer.dom(rangePanel.root).querySelector('#toCalendar'),
          nextButton = Polymer.dom(toCalendar.root).querySelector('#btnNextMonth');

      nextButton.click();

      flush(function() {
        assert.equal(toCalendar.baseDate.toISOString(), "2016-08-11T22:00:00.000Z", "toCalendar baseDate");
        assert.equal(toCalendar.toMoment.toISOString(), "2016-07-11T22:00:00.000Z", "toCalendar toMoment");
        assert.equal(rangePanel.toMoment.toISOString(), "2016-07-11T22:00:00.000Z", "rangePanel  toMoment");
        done();
      });
    });
  });

  test('previous arrow does not change fromMoment', function(done) {

    rangePanel.fromMoment = Px.moment("2016-06-01T20:00:00Z");
    rangePanel.toMoment = Px.moment("2016-07-11T22:00:00Z");

    flush(function() {
      var fromCalendar = Polymer.dom(rangePanel.root).querySelector('#fromCalendar'),
          fromCalendarButtons = Polymer.dom(fromCalendar.root).querySelectorAll('button'),
          previousButton = fromCalendarButtons[0];

      previousButton.click();

      flush(function() {
        assert.equal(fromCalendar.baseDate.toISOString(), "2016-05-01T20:00:00.000Z", "fromCalendar baseDate");
        assert.equal(fromCalendar.fromMoment.toISOString(), "2016-06-01T20:00:00.000Z", "fromCalendar fromMoment");
        assert.equal(rangePanel.fromMoment.toISOString(), "2016-06-01T20:00:00.000Z", "rangePanel  fromMoment");
        done();
      });
    });
  });

  test('"to" calendar cant be same as "from" calendar', function(done) {

    rangePanel.toBaseDate = Px.moment("2016-06-11T22:00:00Z");

    flush(function() {
      assert.isFalse(rangePanel.toBaseDate.isSame(rangePanel.fromBaseDate, 'month'));
      done();
    });
  });

  test('"to" calendar cant be before "from" calendar', function(done) {

    rangePanel.toBaseDate = Px.moment("2016-04-11T22:00:00Z");

    flush(function() {
      assert.isFalse(rangePanel.toBaseDate.isBefore(rangePanel.fromBaseDate, 'month'));
      done();
    });
  });

  test('"from" calendar cant be same as "to" calendar', function(done) {

    rangePanel.fromBaseDate = Px.moment("2016-07-11T22:00:00Z");

    flush(function() {
      assert.isFalse(rangePanel.toBaseDate.isSame(rangePanel.fromBaseDate, 'month'));
      done();
    });
  });

  test('"from" calendar cant be after "to" calendar', function(done) {

    rangePanel.fromBaseDate = Px.moment("2016-09-11T22:00:00Z");

    flush(function() {
      assert.isFalse(rangePanel.fromBaseDate.isAfter(rangePanel.toBaseDate, 'month'));
      done();
    });
  });

});

suite('select dates on calendars', function() {
  let rangePanel, fromCal, toCal;

  //reset from base dates for every tests
  setup(function(done) {
    rangePanel = fixture('range_panel');
    fromCal = Polymer.dom(rangePanel.root).querySelectorAll('px-calendar-picker')[0];
    toCal = Polymer.dom(rangePanel.root).querySelectorAll('px-calendar-picker')[1];

    rangePanel.fromBaseDate = Px.moment("2016-06-02T00:00:00Z");
    rangePanel.toBaseDate = Px.moment("2016-07-11T00:00:00Z");
    rangePanel.fromMoment = Px.moment("2016-06-02T00:00:00Z");
    rangePanel.toMoment = Px.moment("2016-07-11T00:00:00Z");

    flush(function() {
      done();
    });
  });

  test('range is fully on from calendar', function(done) {

    //we don't want to dive into the implementation details of calendar and cells.
    //simulate selection by firing events ourselves
    var firstSelection = Px.moment("2016-06-03T20:00:00Z"),
        secondSelection = Px.moment("2016-06-17T22:00:00Z"),
        prevFrom = rangePanel.fromMoment,
        prevTo = rangePanel.toMoment;

    //simulate first selection on from cal
    fromCal._selectDate(firstSelection);
    flush(function() {
      //propagate event that first selection happened
      fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

      //simulate second selection
      fromCal._selectDate(secondSelection);
      flush(function() {
        //propagate second selection
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

        //moment range should have been set
        assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

        //both calendars should have their moment synchronized
        assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
        assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

        done();
      });
    });
  });

  test('range is fully on from calendar, reversed', function(done) {

    //we don't want to dive into the implementation details of calendar and cells.
    //simulate selection by firing events ourselves
    var firstSelection = Px.moment("2016-06-03T20:00:00Z"),
        secondSelection = Px.moment("2016-06-17T22:00:00Z"),
        prevFrom = rangePanel.fromMoment,
        prevTo = rangePanel.toMoment;

    //simulate first selection on from cal
    fromCal._selectDate(secondSelection);
    flush(function() {
      //propagate event that first selection happened
      fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

      //simulate second selection
      fromCal._selectDate(firstSelection);
      flush(function() {
        //propagate second selection
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

        //moment range should have been set
        assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

        //both calendars should have their moment synchronized
        //from calendar would usually deal with swappingdates, doesn't happen here since
        //we've forced simulated selection
        assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment, 'day'));
        assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment, 'day'));

        done();
      });
    });
  });

  test('time should be preserved when changing dates', function(done) {
    //we don't want to dive into the implementation details of calendar and cells.
    //simulate selection by firing events ourselves
    var firstSelection = Px.moment("2016-06-03T20:00:00Z"),
        secondSelection = Px.moment("2016-06-17T22:00:00Z"),
        prevFrom = rangePanel.fromMoment,
        prevTo = rangePanel.toMoment;

    //make sure the time are different
    firstSelection.minute(prevFrom.minute() + 20);
    secondSelection.minute(prevTo.minute() + 20);

    //simulate first selection on from cal
    fromCal._selectDate(firstSelection);
    flush(function() {
      //propagate event that first selection happened
      fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

      //simulate second selection
      fromCal._selectDate(secondSelection);
      flush(function() {
        //propagate second selection
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

        //time should have been preserved
        assert.equal(prevFrom.hour(), rangePanel.fromMoment.hour());
        assert.equal(prevFrom.minute(), rangePanel.fromMoment.minute());
        assert.equal(prevFrom.second(), rangePanel.fromMoment.second());
        assert.equal(prevFrom.millisecond(), rangePanel.fromMoment.millisecond());

        done();
      });
    });
  });

  test('range is fully on to calendar', function(done) {

    //we don't want to dive into the implementation details of calendar and cells.
    //simulate selection by firing events ourselves
    var firstSelection = Px.moment("2016-07-03T00:00:00Z"),
        secondSelection = Px.moment("2016-07-17T00:00:00Z");

    //simulate first selection on to cal
    toCal._selectDate(firstSelection);
    flush(function() {
      //propagate event that first selection happened
      toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

      //simulate second selection
      toCal._selectDate(secondSelection);
      flush(function() {
        //propagate second selection
        toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

        //moment range should have been set
        assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

        //both calendars should have their moment synchronized
        assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
        assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

        done();
      });
    });
  });

  test('range is fully on to calendar, reversed', function(done) {

    //we don't want to dive into the implementation details of calendar and cells.
    //simulate selection by firing events ourselves
    var firstSelection = Px.moment("2016-07-03T00:00:00Z"),
        secondSelection = Px.moment("2016-07-17T00:00:00Z");

    //simulate first selection on to cal
    toCal._selectDate(secondSelection);
    flush(function() {
      //propagate event that first selection happened
      toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

      //simulate second selection
      toCal._selectDate(firstSelection);
      flush(function() {
        //propagate second selection
        toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

        //moment range should have been set
        assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

        //both calendars should have their moment synchronized
        assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment, 'day'));
        assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment, 'day'));

        done();
      });
    });
  });


  test('first selection on from, second on to', function(done) {

    //we don't want to dive into the implementation details of calendar and cells.
    //simulate selection by firing events ourselves
    var firstSelection = Px.moment("2016-06-03T00:00:00Z"),
        secondSelection = Px.moment("2016-07-17T00:00:00Z");

    //simulate first selection on from cal
    fromCal._selectDate(firstSelection);
    flush(function() {
      //propagate event that first selection happened
      fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

      //simulate second selection
      toCal._selectDate(secondSelection);
      flush(function() {
        //propagate second selection
        toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

        //moment range should have been set
        assert.isTrue(firstSelection.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(secondSelection.isSame(rangePanel.toMoment, 'day'));

        //both calendars should have their moment synchronized
        assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
        assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

        done();
      });
    });
  });

  test('first selection on to, second on from', function(done) {

    //we don't want to dive into the implementation details of calendar and cells.
    //simulate selection by firing events ourselves
    var firstSelection = Px.moment("2016-07-03T00:00:00Z"),
        secondSelection = Px.moment("2016-06-17T00:00:00Z");

    //simulate first selection on from cal
    toCal._selectDate(firstSelection);
    flush(function() {
      //propagate event that first selection happened
      toCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': firstSelection }));

      //simulate second selection
      fromCal._selectDate(secondSelection);
      flush(function() {
        //propagate second selection
        fromCal.dispatchEvent(new CustomEvent('px-date-selected', { 'detail': secondSelection }));

        //moment range should have been set
        assert.isTrue(secondSelection.isSame(rangePanel.fromMoment, 'day'));
        assert.isTrue(firstSelection.isSame(rangePanel.toMoment, 'day'));

        //both calendars should have their moment synchronized
        assert.isTrue(fromCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(toCal.fromMoment.isSame(rangePanel.fromMoment));
        assert.isTrue(fromCal.toMoment.isSame(rangePanel.toMoment));
        assert.isTrue(toCal.toMoment.isSame(rangePanel.toMoment));

        done();
      });
    });
  });
});

suite('select last month presets', function(done) {
  let rangePanel, now, startOfMonth, endOfMonth;

  setup(function(done) {
    rangePanel = fixture('range_panel');
    now = moment.tz(moment(), rangePanel.timeZone);
    startOfMonth = now.clone().subtract(1, 'months').startOf('month');
    endOfMonth = now.clone().subtract(1, 'months').endOf('month');

    //set old calendars
    rangePanel.fromBaseDate = Px.moment("2011-06-02T00:00:00Z");
    rangePanel.toBaseDate = Px.moment("2012-07-11T00:00:00Z");

    flush(function() {

      //now simulate 'last month' preset selection
      rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                  { 'detail':  {
                    "displayText": "Last Month",
                    "startDateTime": startOfMonth,
                    "endDateTime": endOfMonth
                  }}));
      flush(function() {
        done();
      });
    });
  });

  test('shows appropriate calendars', function() {

    assert.isTrue(rangePanel.fromBaseDate.isSame(startOfMonth, 'month'));
    assert.isTrue(rangePanel.toBaseDate.isSame(endOfMonth.clone().add(1, 'month'), 'month'));
  });

  test('moments have been updated', function() {

    assert.isTrue(rangePanel.fromMoment.isSame(startOfMonth, 'day'));
    assert.isTrue(rangePanel.toMoment.isSame(endOfMonth, 'day'));
  });
});

suite('select this month presets with future dates blocked doesnt select the whole month', function(done) {
  let rangePanel, now, startOfMonth, endOfMonth;

  setup(function(done) {
    rangePanel = fixture('range_panel');
    now = moment.tz(moment(), rangePanel.timeZone);
    startOfMonth = now.clone().startOf('month');
    endOfMonth = now.clone().endOf('month');

    //set old calendars
    rangePanel.fromBaseDate = Px.moment("2011-06-02T00:00:00Z");
    rangePanel.toBaseDate = Px.moment("2012-07-11T00:00:00Z");

    rangePanel.blockFutureDates = true;

    flush(function() {

      //now simulate 'this month' preset selection
      rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                  { 'detail':  {
                    "displayText": "This Month",
                    "startDateTime": startOfMonth,
                    "endDateTime": endOfMonth
                  }}));
      flush(function() {
        done();
      });
    });
  });

  test('shows appropriate calendars', function() {
    assert.isTrue(rangePanel.fromMoment.isSame(startOfMonth, 'day'));
    assert.isTrue(rangePanel.toMoment.isSame(now, 'day'));
  });
});

suite('select this month presets with future dates blocked doesnt select the whole month', function(done) {
  let rangePanel, now, startOfMonth, endOfMonth;

  setup(function(done) {
    rangePanel = fixture('range_panel');
    now = moment.tz(moment(), rangePanel.timeZone);
    startOfMonth = now.clone().startOf('month');
    endOfMonth = now.clone().endOf('month');

    //set old calendars
    rangePanel.fromBaseDate = Px.moment("2011-06-02T00:00:00Z");
    rangePanel.toBaseDate = Px.moment("2012-07-11T00:00:00Z");

    rangePanel.blockFutureDates = false;
    rangePanel.blockPastDates = true;

    flush(function() {

      //now simulate 'this month' preset selection
      rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                  { 'detail':  {
                    "displayText": "This Month",
                    "startDateTime": startOfMonth,
                    "endDateTime": endOfMonth
                  }}));
      flush(function() {
        done();
      });
    });
  });

  test('shows appropriate calendars', function() {
    assert.isTrue(rangePanel.fromMoment.isSame(now, 'day'));
    assert.isTrue(rangePanel.toMoment.isSame(endOfMonth, 'day'));
  });
});

suite('select last 10 minutes presets', function(done) {
  let rangePanel, now, startDateTime, endDateTime;

  setup(function(done) {
    rangePanel = fixture('range_panel');
    now = moment.tz(moment(), rangePanel.timeZone);
    startDateTime = now.clone().subtract(10, 'minutes');
    endDateTime = now.clone();

    //set old calendars
    rangePanel.fromBaseDate = Px.moment("2011-06-02T00:00:00Z");
    rangePanel.toBaseDate = Px.moment("2012-07-11T00:00:00Z");

    flush(function() {

      //now simulate 'last month' preset selection
      rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                  { 'detail':  {
                    "displayText": "Last Month",
                    "startDateTime": startDateTime,
                    "endDateTime": endDateTime
                  }}));
      flush(function() {
        setTimeout(function() {
          done();
        },50);
      });
    });
  });

  test('shows appropriate calendars', function() {
    assert.isTrue(rangePanel.fromBaseDate.isSame(startDateTime, 'month'));
    assert.isTrue(rangePanel.toBaseDate.isSame(endDateTime.clone().add(1, 'month'), 'month'));
  });

  test('moments have been updated', function() {
    assert.isTrue(rangePanel.fromMoment.isSame(startDateTime, 'second'));
    assert.isTrue(rangePanel.toMoment.isSame(endDateTime, 'second'));
  });
});


suite('select function presets', function(done) {
  let rangePanel, now, startDateTime, endDateTime;

  setup(function(done) {
    rangePanel = fixture('range_panel');
    now = moment.tz(moment(), rangePanel.timeZone);
    startDateTime = function() {return now.clone().subtract(10, 'minutes');};
    endDateTime = function() {return now.clone();};

    //set old calendars
    rangePanel.fromBaseDate = Px.moment("2011-06-02T00:00:00Z");
    rangePanel.toBaseDate = Px.moment("2012-07-11T00:00:00Z");

    flush(function() {

      //now simulate 'last month' preset selection
      rangePanel.dispatchEvent(new CustomEvent('px-preset-selected',
                  { 'detail':  {
                    "displayText": "Last Month",
                    "startDateTime": startDateTime,
                    "endDateTime": endDateTime
                  }}));
      flush(function() {
        done();
      });
    });
  });

  test('shows appropriate calendars', function() {
    assert.isTrue(rangePanel.fromBaseDate.isSame(startDateTime(), 'month'));
    assert.isTrue(rangePanel.toBaseDate.isSame(endDateTime().clone().add(1, 'month'), 'month'));
  });

  test('moments have been updated', function() {
    assert.isTrue(rangePanel.fromMoment.isSame(startDateTime(), 'second'));
    assert.isTrue(rangePanel.toMoment.isSame(endDateTime(), 'second'));
  });
});
