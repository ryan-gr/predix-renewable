suite('Navigation', function() {
  let range, fireKeyboardEvent;

  setup(function(done) {
    range = fixture('range');
    fireKeyboardEvent = function(elem, key){
      var evt = new CustomEvent('keydown',{detail:{'key':key,'keyIdentifier':key}});
       elem.dispatchEvent(evt);
    };
    flush(()=>{
      done();
    });
  });

  test('navigation from "from" to "to"', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        fromEntries = Polymer.dom(fields[0].root).querySelectorAll('px-datetime-entry'),
        fromTimeCells = Polymer.dom(fromEntries[1].root).querySelectorAll('px-datetime-entry-cell'),
        spy = sinon.spy(range, '_focusFirstToEntry');
    fireKeyboardEvent(fromTimeCells[fromTimeCells.length - 1], 'ArrowRight');
    setTimeout(function() {
      assert.isTrue(spy.called);
      range._focusFirstToEntry.restore();
      done();
    },100);
  });

  test('navigation from "from" to "to" doesnt trigger next-field from the outside', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        fromEntries = Polymer.dom(fields[0].root).querySelectorAll('px-datetime-entry'),
        fromTimeCells = Polymer.dom(fromEntries[1].root).querySelectorAll('px-datetime-entry-cell'),
        listener = function() {
          range.removeEventListener('px-next-field', listener);
          assert.isTrue(false); // makes sure this *doesn't* get run
          done();
        };
    range.addEventListener('px-next-field', listener);
    fireKeyboardEvent(fromTimeCells[fromTimeCells.length - 1], 'ArrowRight');
    setTimeout(function() {
      range.removeEventListener('px-next-field', listener);
      done();
    }, 200);
  });

  test('navigation from "to" to "from"', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
        todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
        spy = sinon.spy(range, '_focusLastFromEntry');
    fireKeyboardEvent(todateCells[0], 'ArrowLeft');
    setTimeout(function() {
      assert.isTrue(spy.called);
      range._focusLastFromEntry.restore();
      done();
    },100);
  });

  test('navigation from "to" to "from" doesnt trigger previous-field from the outside', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
        todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
        listener = function() {
          range.removeEventListener('px-previous-field', listener);
          assert.isTrue(false); // makes sure this *doesn't* get run
          done();
        };
    range.addEventListener('px-previous-field', listener);
    fireKeyboardEvent(todateCells[0], 'ArrowLeft');
    setTimeout(function() {
      range.removeEventListener('px-previous-field', listener);
      done();
    }, 200);
  });
});



suite('submit without buttons', function() {
  let range, fields, fromEntries, fromTimeCells;

  setup(function(done) {
    range = fixture('range');
    range.fromMoment = Px.moment("2017-10-01T00:03:44.339Z");
    range.toMoment = Px.moment("2017-10-14T00:03:44.339Z");
    flush(()=>{
      //make sure we focus 'to' field as next tests work on 'to'
      fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field');
      fromEntries = Polymer.dom(fields[0].root).querySelectorAll('px-datetime-entry');
      fromTimeCells = Polymer.dom(fromEntries[1].root).querySelectorAll('px-datetime-entry-cell');
      setTimeout(function() {
        done();
      }, 50);
    });
  });

  test('moment is not changed when changing invalid value', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
        wrapper = Polymer.dom(fields[1].root).querySelector('#fieldWrapper'),
        todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
        dateInput = Polymer.dom(todateCells[1].root).querySelector('input'),
        e = document.createEvent('Event'),
        i=0,
        listener = function(evt) {
          i++;
        };
    range.addEventListener('to-moment-changed', listener);
    dateInput.value = '99';
    e.initEvent("blur", true, true);
    dateInput.dispatchEvent(e);
    setTimeout(function() {
      assert.equal(i, 0);
      assert.isFalse(range.isValid);
      assert.isFalse(range._toValid);
      assert.isTrue(wrapper.classList.contains('validation-error'));
      range.removeEventListener('to-moment-changed', listener);
      done();
    }, 100);
  });

  test('moment is changed when changing valid value', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
        wrapper = Polymer.dom(fields[1].root).querySelector('#fieldWrapper'),
        todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
        dateInput = Polymer.dom(todateCells[1].root).querySelector('input'),
        e = document.createEvent('Event'),
        i = 0;

    var listener = function(evt) {
      assert.isTrue(range.isValid);
      assert.isTrue(range._toValid);
      assert.isFalse(wrapper.classList.contains('validation-error'));
      range.removeEventListener('to-moment-changed', listener);
      done();
    };
    range.addEventListener('to-moment-changed', listener);
    dateInput.value = '12';
    e.initEvent("blur", true, true);

    dateInput.dispatchEvent(e);
  });

  test('moment is not changed when range is backwards', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
        wrapper = Polymer.dom(fields[1].root).querySelector('#fieldWrapper'),
        todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
        dateInput = Polymer.dom(todateCells[1].root).querySelector('input'),
        e = document.createEvent('Event'),
        i = 0,
        listener = function(evt) {
          i++;
        };
    range.addEventListener('to-moment-changed', listener);
    dateInput.value = '01';
    e.initEvent("blur", true, true);
    dateInput.dispatchEvent(e);
    setTimeout(function() {
      assert.equal(i, 0);
      assert.isFalse(range.isValid);
      assert.isFalse(range._isRangeValid);
      assert.isTrue(wrapper.classList.contains('validation-error'));
      range.removeEventListener('to-moment-changed', listener);
      done();
    }, 100);
  });
});



suite('submit with buttons', function() {
  let range, fireKeyboardEvent;

  setup(function(done) {
    range = fixture('range');
    range.showButtons = true;
    range.fromMoment = Px.moment("2017-12-07T00:03:44.339Z");
    range.toMoment = Px.moment("2017-12-14T00:03:44.339Z");
    fireKeyboardEvent = function(elem, key){
      var evt = new CustomEvent('keydown',{detail:{'key':key,'keyIdentifier':key}});
        elem.dispatchEvent(evt);
    };
    flush(()=>{
      setTimeout(function() {
        done();
      },50);
    });
  });

  test('moment is not changed on blur', function(done) {
    var fields = Polymer.dom(range.root).querySelectorAll('px-datetime-field'),
        toEntries = Polymer.dom(fields[1].root).querySelectorAll('px-datetime-entry'),
        todateCells = Polymer.dom(toEntries[0].root).querySelectorAll('px-datetime-entry-cell'),
        dateInput = Polymer.dom(todateCells[1].root).querySelector('input'),
        e = document.createEvent('Event'),
        i = 0,
        listener = function(evt) {
          i++;
        };
    range.addEventListener('to-moment-changed', listener);
    dateInput.value = '12';
    e.initEvent("blur", true, true);
    dateInput.dispatchEvent(e);
    setTimeout(function() {
      assert.equal(i, 0);
      range.removeEventListener('to-moment-changed', listener);
      done();
    }, 100);
  });

  test('moment is changed when pressing enter', function() {
    var i = 0,
        listener = function(evt) {
          i++;
        };
    range.addEventListener('from-moment-changed', listener);
    range._tempFromMomentObj = range.fromMoment.clone().subtract(1, 'month');
    fireKeyboardEvent(range, 'Enter');
    assert.equal(i, 1);
    range.removeEventListener('from-moment-changed', listener);
  });

  test('moment is changed when clicking apply', function() {
    var datetimeButtons = Polymer.dom(range.root).querySelector('px-datetime-buttons'),
        buttons = Polymer.dom(datetimeButtons.root).querySelectorAll('button'),
        i = 0,
        listener = function(evt) {
          i++;
        };
    range.addEventListener('from-moment-changed', listener);
    range._tempFromMomentObj = range.fromMoment.clone().subtract(1, 'month');
    buttons[1].click();
    assert.equal(i, 1);
    range.removeEventListener('from-moment-changed', listener);
  });

  test('moment is rolled back when clicking cancel', function(done) {
    var datetimeButtons = Polymer.dom(range.root).querySelector('px-datetime-buttons'),
        buttons = Polymer.dom(datetimeButtons.root).querySelectorAll('button'),
        prevFromMoment = range.fromMoment.clone(),
        i = 0;
    range._tempFromMomentObj = range.fromMoment.clone().subtract(1, 'month');
    buttons[0].click();
    flush(function() {
      assert.equal(range.fromMoment.toISOString(), prevFromMoment.toISOString());
      done();
    });
  });

  test('moment is rolled back when pressing esc', function(done) {
    var datetimeButtons = Polymer.dom(range.root).querySelector('px-datetime-buttons'),
        prevFromMoment = range.fromMoment.clone();
    range._tempFromMomentObj = range.fromMoment.clone().subtract(1, 'month');
    fireKeyboardEvent(range, 'Esc');
    flush(function() {
      assert.equal(range.fromMoment.toISOString(), prevFromMoment.toISOString());
      done();
    });
  });
});



suite('Passed in moment objs', function() {
  let range;

  setup(function(done) {
    range = fixture('range');
    flush(()=>{
      done();
    });
  });

  test('fails if invalid future date', function(done) {
    range.blockFutureDates = true;
    range.fromMoment = Px.moment().startOf('day').subtract(1, 'days');
    range.toMoment = Px.moment().startOf('day').add(5, 'days');

    flush(()=>{
      assert.isFalse(range.isValid, "validation should fail, future dates not allowed");
      done();
    });
  });
  test('passes if future dates allowed', function(done) {
    range.fromMoment = Px.moment().startOf('day').subtract(1, 'days');
    range.toMoment = Px.moment().startOf('day').add(5, 'days');

    flush(()=>{
      assert.isTrue(range.isValid, "validation should pass, future dates are allowed");
      done();
    });
  });

  test('fails if dates are inverted', function(done) {
    range.fromMoment = Px.moment().startOf('day').add(1, 'days');
    range.toMoment = Px.moment().startOf('day').subtract(5, 'days');

    flush(()=>{
      assert.isFalse(range.isValid, "validation should fail, range is inverted");
      done();
    });
  });

});



suite('layout', function() {
  let rangeFxt, showTitlesFxt;

  setup(function(done) {
    rangeFxt = fixture('range');
    showTitlesFxt = fixture('show-field-titles');
    flush(() => {
      done();
    });
  });

  test('when showFieldTitles is false, `TO` is not hidden', function(done) {
    var spans = Polymer.dom(rangeFxt.root).querySelectorAll('span'),
        isToSpan = false;

    spans.forEach(function(item){
      if (item.classList.contains("dt-to")){
        isToSpan = true;
      }
    });
    assert.equal(isToSpan, true);
    done();
  });
  test('when showFieldTitles is true, `TO` is hidden', function(done) {
    var spans = Polymer.dom(showTitlesFxt.root).querySelectorAll('span'),
    isToSpan = false;

    spans.forEach(function(item){
      if (item.classList.contains("dt-to")){
        isToSpan = true;
      }
    });
    assert.equal(isToSpan, false);
    done();
  });

  test('when showFieldTitles is false, field labels are hidden', function(done) {
    var fieldLabels = Polymer.dom(rangeFxt.root).querySelectorAll('label');
    assert.equal(fieldLabels.length, 0);
    done();
  });
  test('when showFieldTitles is true, field labels are not hidden', function(done) {
    var fieldLabels = Polymer.dom(showTitlesFxt.root).querySelectorAll('label');
    assert.equal(fieldLabels.length, 2);
    done();
  });

  test('when showFieldTitles is true, display flex', function(done) {
    var displayDiv = Polymer.dom(showTitlesFxt.root).querySelector('.dt-fields-justify');

    flush(() => {
      var styles = window.getComputedStyle(displayDiv).display;
      assert.equal(styles, "flex");
      done();
    });
  });
  test('when showFieldTitles and fullWidth are true, display grid', function(done) {
    var displayDiv = Polymer.dom(showTitlesFxt.root).querySelector('.dt-fields-justify');
    showTitlesFxt.fullWidth = true;

    flush(() => {
      var styles = window.getComputedStyle(displayDiv).display,
          isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
          isSafari10 = !!navigator.userAgent.match(/AppleWebKit\/602\./); //Safari didn't get grid till 10.1
      if (isIE11 || isSafari10) {
        //IE doesn't support grid, it falls back to flex
        assert.equal(styles, "flex");
      } else {
        assert.equal(styles, "grid");
      }
      done();
    });
  });
  test('when showFieldTitles, fullWidth, showButtons are true, display flex', function(done) {
    var displayDiv = Polymer.dom(showTitlesFxt.root).querySelector('.dt-fields-justify');
    showTitlesFxt.fullWidth = true;
    showTitlesFxt.showButtons = true;

    flush(() => {
      var styles = window.getComputedStyle(displayDiv).display;
      assert.equal(styles, "flex");
      done();
    });
  });
});
