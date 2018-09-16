suite('Navigation', function() {
  let field, fireKeyboardEvent;

  setup(function(done) {
    field = fixture('px_datetime_field');
    fireKeyboardEvent = function(elem, key){
      var evt = new CustomEvent('keydown',{detail:{'key':key,'keyIdentifier':key}});
       elem.dispatchEvent(evt);
    };
    flush(()=>{
      done();
    });
  });

  test('show date and time', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry');

    assert.isFalse(field.hideTime);
    assert.isFalse(field.hideDate);
    assert.notEqual(entries[0].style.display, 'none');
    assert.notEqual(entries[1].style.display, 'none');

    //hide time
    field.hideTime = true;
    flush(function() {
      entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry');
      assert.notEqual(entries[0].style.display, 'none');
      assert.equal(entries[1].style.display, 'none');

      //show time, hide date
      field.hideTime = false;
      field.hideDate = true;
      flush(function() {
        entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry');
        assert.equal(entries[0].style.display, 'none');
        assert.notEqual(entries[1].style.display, 'none');

        //show date and time again
        field.hideDate = false;
        flush(function() {
          entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry');
          assert.notEqual(entries[0].style.display, 'none');
          assert.notEqual(entries[1].style.display, 'none');
          done();
        });
      });
    });
  });

  test('navigation from date to time', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    var listener = function() {
      entries[0].removeEventListener('px-next-field', listener);
      done();
    };
    entries[0].addEventListener('px-next-field', listener);

    fireKeyboardEvent(dateCells[dateCells.length - 1], 'ArrowRight');
  });

  test('navigation from date to time doesnt trigger next-field from the outside', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    var listener = function() {
      field.removeEventListener('px-next-field', listener);
      assert.isTrue(false);
      done();
    };
    field.addEventListener('px-next-field', listener);

    fireKeyboardEvent(dateCells[dateCells.length - 1], 'ArrowRight');

    setTimeout(function() {
      field.removeEventListener('px-next-field', listener);
      done();
    }, 200);
  });

  test('navigation from time to date', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        timeCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell');

    var listener = function() {
      entries[1].removeEventListener('px-previous-field', listener);
      done();
    };
    entries[1].addEventListener('px-previous-field', listener);

    fireKeyboardEvent(timeCells[0], 'ArrowLeft');
  });

  test('navigation from time to date doesnt trigger previous-field from the outside', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        timeCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell');

    var listener = function() {
      field.removeEventListener('px-previous-field', listener);
      assert.isTrue(false);
      done();
    };
    field.addEventListener('px-previous-field', listener);

    fireKeyboardEvent(timeCells[0], 'ArrowLeft');

    setTimeout(function() {
      field.removeEventListener('px-previous-field', listener);
      done();
    }, 200);
  });

  test('navigation from time to date doesnt trigger previous-field from the outside', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        timeCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell');

    var listener = function() {
      field.removeEventListener('px-previous-field', listener);
      assert.isTrue(false);
      done();
    };
    field.addEventListener('px-previous-field', listener);

    fireKeyboardEvent(timeCells[0], 'ArrowLeft');

    setTimeout(function() {
      field.removeEventListener('px-previous-field', listener);
      done();
    }, 200);
  });

  test('hide time + right arrow on last date cell', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
        timeCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell');

    field.hideTime = true;
    flush(function() {

      var listener = function() {
        field.removeEventListener('px-next-field', listener);
        field.hideTime = false;
        done();
      };
      field.addEventListener('px-next-field', listener);

      fireKeyboardEvent(dateCells[dateCells.length-1], 'ArrowRight');
    });
  });

  test('hide date + left arrow on first time cell', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
        timeCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell');

    field.hideDate = true;
    flush(function() {

      var listener = function() {
        field.removeEventListener('px-previous-field', listener);
        field.hideDate = false;
        done();
      };
      field.addEventListener('px-previous-field', listener);

      fireKeyboardEvent(timeCells[0], 'ArrowLeft');
    });
  });
});


/**
 * SUBMIT WITHOUT BUTTONS
 */
suite('submit without buttons', function() {
  let field, entries, dateCells, dateInput, wrapper;

  setup(function(done) {
    field = fixture('px_datetime_field');
    field.momentObj = Px.moment();

    flush(()=>{
      entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry');
      dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');
      dateInput = Polymer.dom(dateCells[1].root).querySelector('input');
      wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      done();
    });
  });

  test('event is not fired when changing invalid value on blur', function(done) {
    var i = 0,
        e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    // debugger
    //invalid month, should not trigger event
    dateInput.value = '99';
    e.initEvent("blur", true, true);
    field.dispatchEvent(e);

    flush(function() {
      assert.equal(i, 0);
      // debugger
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('event is fired when changing valid value on blur', function(done) {
    var i = 0,
        e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    //valid month, should trigger event
    dateInput.value = '03';
    e.initEvent("blur", true, true);
    field.dispatchEvent(e);

    flush(function() {
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('event is not fired when changing invalid value on Enter', function(done) {
    var i = 0,
        e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    //invalid month, should not trigger event
    dateInput.value = '99';
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.equal(i, 0);
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('event is fired when changing valid value on Enter', function(done) {
    var i = 0,
        e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    //valid month, should trigger event
    dateInput.value = '03';
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });
});


/**
 * SUBMIT WITH BUTTONS
 */
suite('submit with buttons', function() {

  let fieldBtn, fieldBtnBlank, fieldBtnBlankRequired, entries, dateCells, dateInput, wrapper;

  setup(function(done) {
    fieldBtn = fixture('px_datetime_field required buttons');
    fieldBtn.momentObj = Px.moment("2017-12-01T00:00:00.000");

    flush(()=>{
      entries = Polymer.dom(fieldBtn.root).querySelectorAll('px-datetime-entry');
      dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');
      dateInput = Polymer.dom(dateCells[1].root).querySelector('input');
      wrapper = Polymer.dom(fieldBtn.root).querySelector('#fieldWrapper');
      done();
    });
  });

  test('event is fired when changing valid value on blur', function(done) {
    var i = 0,
        e = document.createEvent('Event');

        var listener = function(evt) { i++; };
        fieldBtn.addEventListener('px-moment-changed', listener);

    dateInput.value = "11";
    e.initEvent("blur", true, true);
    fieldBtn.dispatchEvent(e);

    flush(function() {
      assert.equal(i, 1);
      fieldBtn.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('event is fired when pressing enter', function(done) {
    var i = 0;

    var listener = function(evt) { i++; };
    fieldBtn.addEventListener('px-moment-changed', listener);

    //do a change
    dateInput.value = "09";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.equal(i, 1);
      fieldBtn.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('event is fired when clicking apply', function(done) {
    var buttons = Polymer.dom(fieldBtn.root).querySelectorAll('px-datetime-buttons'),
        applyBtn = Polymer.dom(buttons[0].root).querySelectorAll('#submitButton'),
        i = 0;

    var listener = function(evt) { i++; };
    fieldBtn.addEventListener('px-moment-changed', listener);

    dateInput.value = "11";
    applyBtn[0].click();

    flush(()=>{
      assert.equal(i, 1);
      fieldBtn.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('Cancel reverts to last moment obj', function(done) {
    var cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry'),
        buttonsElem = Polymer.dom(fieldBtn.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    buttons[0].click();

    flush(function() {
      assert.equal(cell0Input[0].value, "2017");
      assert.equal(cell1Input[0].value, "12");
      assert.equal(cell2Input[0].value, "01");
      var wrapper = Polymer.dom(fieldBtn.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Esc reverts to last moment obj', function(done) {
    var cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 27, [], 'Escape');

    flush(function() {
      assert.equal(cell0Input[0].value, "2017");
      assert.equal(cell1Input[0].value, "12");
      assert.equal(cell2Input[0].value, "01");
      var wrapper = Polymer.dom(fieldBtn.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Cancel clears validation', function(done) {
    var cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry'),
        buttonsElem = Polymer.dom(fieldBtn.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');
        wrapper = Polymer.dom(fieldBtn.root).querySelector('#fieldWrapper');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "99";
    cell2Input[0].value = "99";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      buttons[0].click();

      flush(function() {
        assert.equal(cell0Input[0].value, "2017");
        assert.equal(cell1Input[0].value, "12");
        assert.equal(cell2Input[0].value, "01");
        assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
        done();
      });
    });
  });

  test('Esc clears validation', function(done) {
    var cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry'),
        buttonsElem = Polymer.dom(fieldBtn.root).querySelectorAll('px-datetime-buttons');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "99";
    cell2Input[0].value = "99";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      MockInteractions.pressAndReleaseKeyOn(dateCells[1], 27, [], 'Escape');

      flush(function() {
        assert.equal(cell0Input[0].value, "2017");
        assert.equal(cell1Input[0].value, "12");
        assert.equal(cell2Input[0].value, "01");
        assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
        done();
      });
    });
  });
});

/**
 * CANCEL & ESCAPE WITH BUTTONS SHOW DATE & TIME
 */
suite('Cancel & Escape with buttons blank show date & time', function() {

  let fieldBtnBlank, entries, dateCells, cell0Input, cell1Input, cell2Input;
  let fieldBtnBlankRqd, entriesRqd, dateCellsRqd, cell0InputRqd, cell1InputRqd, cell2InputRqd;

  setup(function(done) {
    fieldBtnBlank = fixture('px_datetime_field buttons');
    fieldBtnBlankRqd = fixture('px_datetime_field required buttons');

    flush(()=>{
      entries = Polymer.dom(fieldBtnBlank.root).querySelectorAll('px-datetime-entry'),
      dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
      cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
      cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
      cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry');

      entriesRqd = Polymer.dom(fieldBtnBlankRqd.root).querySelectorAll('px-datetime-entry'),
      dateCellsRqd = Polymer.dom(entriesRqd[0].root).querySelectorAll('px-datetime-entry-cell'),
      cell0InputRqd = Polymer.dom(dateCellsRqd[0].root).querySelectorAll('#dtEntry'),
      cell1InputRqd = Polymer.dom(dateCellsRqd[1].root).querySelectorAll('#dtEntry'),
      cell2InputRqd = Polymer.dom(dateCellsRqd[2].root).querySelectorAll('#dtEntry');

      done();
    });
  });

  test('Field is blank if no moment is set', function(done) {
    assert.equal(cell0Input[0].value, "");
    assert.equal(cell1Input[0].value, "");
    assert.equal(cell2Input[0].value, "");
    done();
  });

  test('Cancel reverts to empty clear, valid if not required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlank.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    buttons[0].click();

    flush(function() {
      assert.equal(cell0Input[0].value, "");
      assert.equal(cell1Input[0].value, "");
      assert.equal(cell2Input[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlank.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Cancel reverts to empty clear, invalid if required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankRqd.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0InputRqd[0].value = "2011";
    cell1InputRqd[0].value = "11";
    cell2InputRqd[0].value = "11";
    buttons[0].click();

    flush(function() {
      assert.equal(cell0InputRqd[0].value, "");
      assert.equal(cell1InputRqd[0].value, "");
      assert.equal(cell2InputRqd[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankRqd.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Esc reverts to empty clear, valid if not required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlank.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 27, [], 'Escape');

    flush(function() {
      assert.equal(cell0Input[0].value, "");
      assert.equal(cell1Input[0].value, "");
      assert.equal(cell2Input[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlank.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Esc reverts to empty clear, invalid if required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankRqd.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0InputRqd[0].value = "2011";
    cell1InputRqd[0].value = "11";
    cell2InputRqd[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCellsRqd[1], 27, [], 'Escape');

    flush(function() {
      assert.equal(cell0InputRqd[0].value, "");
      assert.equal(cell1InputRqd[0].value, "");
      assert.equal(cell2InputRqd[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankRqd.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

});

/**
 * CANCEL & ESCAPE WITH BUTTONS hide Date
 */
suite('Cancel & Escape with buttons blank hide date', function() {

  let fieldBtnBlankHDate, entries, dateCells, cell0Input, cell1Input, cell2Input;
  let fieldBtnBlankHDateRqd, entriesRqd, dateCellsRqd, cell0InputRqd, cell1InputRqd, cell2InputRqd;

  setup(function(done) {
    fieldBtnBlankHDate = fixture('px_datetime_field hideDate buttons');
    fieldBtnBlankHDateRqd = fixture('px_datetime_field hideDate required buttons');

    flush(()=>{
      entries = Polymer.dom(fieldBtnBlankHDate.root).querySelectorAll('px-datetime-entry'),
      dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
      cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
      cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
      cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry');

      entriesRqd = Polymer.dom(fieldBtnBlankHDateRqd.root).querySelectorAll('px-datetime-entry'),
      dateCellsRqd = Polymer.dom(entriesRqd[0].root).querySelectorAll('px-datetime-entry-cell'),
      cell0InputRqd = Polymer.dom(dateCellsRqd[0].root).querySelectorAll('#dtEntry'),
      cell1InputRqd = Polymer.dom(dateCellsRqd[1].root).querySelectorAll('#dtEntry'),
      cell2InputRqd = Polymer.dom(dateCellsRqd[2].root).querySelectorAll('#dtEntry');

      done();
    });
  });

  test('Field is blank if no moment is set', function(done) {
    assert.equal(cell0Input[0].value, "");
    assert.equal(cell1Input[0].value, "");
    assert.equal(cell2Input[0].value, "");
    done();
  });

  test('Cancel reverts to empty clear, valid if not required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHDate.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    buttons[0].click();

    flush(function() {
      assert.equal(cell0Input[0].value, "");
      assert.equal(cell1Input[0].value, "");
      assert.equal(cell2Input[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHDate.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Cancel reverts to empty clear, invalid if required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHDateRqd.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0InputRqd[0].value = "11";
    cell1InputRqd[0].value = "11";
    cell2InputRqd[0].value = "11";
    buttons[0].click();

    flush(function() {
      assert.equal(cell0InputRqd[0].value, "");
      assert.equal(cell1InputRqd[0].value, "");
      assert.equal(cell2InputRqd[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHDateRqd.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Esc reverts to empty clear, valid if not required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHDate.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 27, [], 'Escape');

    flush(function() {
      assert.equal(cell0Input[0].value, "");
      assert.equal(cell1Input[0].value, "");
      assert.equal(cell2Input[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHDate.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Esc reverts to empty clear, invalid if required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHDateRqd.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0InputRqd[0].value = "11";
    cell1InputRqd[0].value = "11";
    cell2InputRqd[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCellsRqd[1], 27, [], 'Escape');

    flush(function() {
      assert.equal(cell0InputRqd[0].value, "");
      assert.equal(cell1InputRqd[0].value, "");
      assert.equal(cell2InputRqd[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHDateRqd.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

});

/**
 * CANCEL & ESCAPE WITH BUTTONS hide Time
 */
suite('Cancel & Escape with buttons blank hide time', function() {

  let fieldBtnBlankHTime, entries, dateCells, cell0Input, cell1Input, cell2Input;
  let fieldBtnBlankHTimeRqd, entriesRqd, dateCellsRqd, cell0InputRqd, cell1InputRqd, cell2InputRqd;

  setup(function(done) {
    fieldBtnBlankHTime = fixture('px_datetime_field hideTime buttons');
    fieldBtnBlankHTimeRqd = fixture('px_datetime_field hideTime required buttons');

    flush(()=>{
      entries = Polymer.dom(fieldBtnBlankHTime.root).querySelectorAll('px-datetime-entry'),
      dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
      cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
      cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
      cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry');

      entriesRqd = Polymer.dom(fieldBtnBlankHTimeRqd.root).querySelectorAll('px-datetime-entry'),
      dateCellsRqd = Polymer.dom(entriesRqd[0].root).querySelectorAll('px-datetime-entry-cell'),
      cell0InputRqd = Polymer.dom(dateCellsRqd[0].root).querySelectorAll('#dtEntry'),
      cell1InputRqd = Polymer.dom(dateCellsRqd[1].root).querySelectorAll('#dtEntry'),
      cell2InputRqd = Polymer.dom(dateCellsRqd[2].root).querySelectorAll('#dtEntry');

      done();
    });
  });

  test('Field is blank if no moment is set', function(done) {
    assert.equal(cell0Input[0].value, "");
    assert.equal(cell1Input[0].value, "");
    assert.equal(cell2Input[0].value, "");
    done();
  });

  test('Cancel reverts to empty clear, valid if not required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHTime.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    buttons[0].click();

    flush(function() {
      assert.equal(cell0Input[0].value, "");
      assert.equal(cell1Input[0].value, "");
      assert.equal(cell2Input[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHTime.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Cancel reverts to empty clear, invalid if required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHTimeRqd.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0InputRqd[0].value = "2011";
    cell1InputRqd[0].value = "11";
    cell2InputRqd[0].value = "11";
    buttons[0].click();

    flush(function() {
      assert.equal(cell0InputRqd[0].value, "");
      assert.equal(cell1InputRqd[0].value, "");
      assert.equal(cell2InputRqd[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHTimeRqd.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Esc reverts to empty clear, valid if not required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHTime.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0Input[0].value = "2011";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 27, [], 'Escape');

    flush(function() {
      assert.equal(cell0Input[0].value, "");
      assert.equal(cell1Input[0].value, "");
      assert.equal(cell2Input[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHTime.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Esc reverts to empty clear, invalid if required', function(done) {
    var buttonsElem = Polymer.dom(fieldBtnBlankHTimeRqd.root).querySelectorAll('px-datetime-buttons'),
        buttons = Polymer.dom(buttonsElem[0].root).querySelectorAll('button');

    cell0InputRqd[0].value = "2011";
    cell1InputRqd[0].value = "11";
    cell2InputRqd[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCellsRqd[1], 27, [], 'Escape');

    flush(function() {
      assert.equal(cell0InputRqd[0].value, "");
      assert.equal(cell1InputRqd[0].value, "");
      assert.equal(cell2InputRqd[0].value, "");
      var wrapper = Polymer.dom(fieldBtnBlankHTimeRqd.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

});



/**
 * BLOCKING OF DATES/TIMES
 */
suite('Blocking of dates/times & minDate/maxDate', function() {
  let field;

  setup(function(done) {
    field = fixture('px_datetime_field');
    field.momentObj = Px.moment();
    flush(()=>{
      done();
    });
  });

  test('blocking of future dates', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell'),
        hourInput = Polymer.dom(dateCells[0].root).querySelector('input'),
        i = 0,
        e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    field.blockFutureDates = true;
    hourInput.value = Px.moment.tz(hourInput.value, 'h', field.timeZone).add(1, 'hour').hour();
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.equal(i, 0); //invalid datetime, should not trigger event
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('blocking of past dates', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell'),
        hourInput = Polymer.dom(dateCells[0].root).querySelector('input'),
        i = 0,
        e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    field.blockPastDates = true;
    hourInput.value = Px.moment.tz(hourInput.value, 'h', field.timeZone).subtract(1, 'hour').hour();

    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.equal(i, 0); //invalid datetime, should not trigger event
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('blocking of dates after maxDate', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
    dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
    dateInput = Polymer.dom(dateCells[1].root).querySelector('input'),
    i = 0,
    e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    field.maxDate = field.momentObj.clone().subtract(1, 'hour');
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.equal(i, 0); //invalid datetime, should not trigger event
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });

  test('blocking of dates before minDate', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
        dateInput = Polymer.dom(dateCells[1].root).querySelector('input'),
        i = 0,
        e = document.createEvent('Event');

    var listener = function(evt) { i++; };
    field.addEventListener('px-moment-changed', listener);

    field.minDate = field.momentObj.clone().add(1, 'hour');
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      assert.equal(i, 0); //invalid datetime, should not trigger event
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      field.removeEventListener('px-moment-changed', listener);
      done();
    });
  });
});


/**
 * REQUIRED
 */
suite('submit when required', function() {
  let field, fieldBtn, fieldHDate, fieldBtnHDate, fieldHTime, fieldBtnHTime;

  setup(function(done) {
    field = fixture('px_datetime_field required');
    fieldBtn = fixture('px_datetime_field required buttons');
    fieldHDate = fixture('px_datetime_field hideDate required');
    fieldBtnHDate = fixture('px_datetime_field hideDate required buttons');
    fieldHTime = fixture('px_datetime_field hideTime required');
    fieldBtnHTime = fixture('px_datetime_field hideTime required buttons');
    flush(()=>{
      done();
    });
  });

  test('validation incomplete with empty field on enter', function(done) {
    var entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('validation incomplete with empty field on enter with buttons', function(done) {
    var entries = Polymer.dom(fieldBtn.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldBtn.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('validation incomplete with empty field on apply with buttons', function(done) {
    var buttons = Polymer.dom(fieldBtn.root).querySelectorAll('px-datetime-buttons'),
        applyBtn = Polymer.dom(buttons[0].root).querySelectorAll('#submitButton');

    applyBtn[0].click();

    flush(function() {
      var wrapper = Polymer.dom(fieldBtn.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide date: validation incomplete with empty field on enter', function(done) {
    var entries = Polymer.dom(fieldHDate.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldHDate.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide date: validation incomplete with empty field on enter with buttons', function(done) {
    var entries = Polymer.dom(fieldBtnHDate.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldBtnHDate.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide date: validation incomplete with empty field on apply with buttons', function(done) {
    var buttons = Polymer.dom(fieldBtnHDate.root).querySelectorAll('px-datetime-buttons'),
        applyBtn = Polymer.dom(buttons[0].root).querySelectorAll('#submitButton');

    applyBtn[0].click();

    flush(function() {
      var wrapper = Polymer.dom(fieldBtnHDate.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide time: validation incomplete with empty field on enter', function(done) {
    var entries = Polymer.dom(fieldHTime.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldHTime.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide time: validation incomplete with empty field on enter with buttons', function(done) {
    var entries = Polymer.dom(fieldBtnHTime.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');

    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldBtnHTime.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide time: validation incomplete with empty field on apply with buttons', function(done) {
    var buttons = Polymer.dom(fieldBtnHTime.root).querySelectorAll('px-datetime-buttons'),
        applyBtn = Polymer.dom(buttons[0].root).querySelectorAll('#submitButton');

    applyBtn[0].click();

    flush(function() {
      var wrapper = Polymer.dom(fieldBtnHTime.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });
});


/**
 * INVAILD
 */
suite('Invalid', function() {
  let field, entries, dateCells, timeCells,
      fieldHDate, entriesHDate, timeCellsHDate,
      fieldHTime, entriesHTime, dateCellsHTime;

  setup(function(done) {
    field = fixture('px_datetime_field');
    fieldHDate = fixture('px_datetime_field hideDate');
    fieldHTime = fixture('px_datetime_field hideTime');

    flush(()=>{
      entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry');
      dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell');
      timeCells = Polymer.dom(entries[1].root).querySelectorAll('px-datetime-entry-cell');

      entriesHDate = Polymer.dom(fieldHDate.root).querySelectorAll('px-datetime-entry');
      timeCellsHDate = Polymer.dom(entriesHDate[0].root).querySelectorAll('px-datetime-entry-cell');

      entriesHTime = Polymer.dom(fieldHTime.root).querySelectorAll('px-datetime-entry');
      dateCellsHTime = Polymer.dom(entriesHTime[0].root).querySelectorAll('px-datetime-entry-cell');
      setTimeout(function() {
        done();
      },50);
    });
  });

  test('Invalid if dateEntry is filled out but timeEntry is blank', function(done) {
    var cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry');
        cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "2000";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Invalid if timeEntry is filled out but dateEntry is blank', function(done) {
    var cell3Input = Polymer.dom(timeCells[0].root).querySelectorAll('#dtEntry'),
    cell4Input = Polymer.dom(timeCells[1].root).querySelectorAll('#dtEntry');
    cell5Input = Polymer.dom(timeCells[2].root).querySelectorAll('#dtEntry');

    cell3Input[0].value = "11";
    cell4Input[0].value = "11";
    cell5Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(timeCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Invalid if one cell has a value and the rest are blank', function(done) {
    var cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry');

    cell1Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide date: Invalid if one cell has a value and the rest are blank', function(done) {
    var cell1Input = Polymer.dom(timeCellsHDate[1].root).querySelectorAll('#dtEntry');

    cell1Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(timeCellsHDate[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldHDate.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide time: Invalid if one cell has a value and the rest are blank', function(done) {
    var cell1Input = Polymer.dom(dateCellsHTime[1].root).querySelectorAll('#dtEntry');

    cell1Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCellsHTime[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldHTime.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Invalid if one cell is blank and the rest are filled out', function(done) {
    var cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry'),
        cell3Input = Polymer.dom(timeCells[0].root).querySelectorAll('#dtEntry'),
        cell4Input = Polymer.dom(timeCells[1].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    cell3Input[0].value = "11";
    cell4Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(timeCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide date: Invalid if one cell is blank and the rest are filled out', function(done) {
    var cell0Input = Polymer.dom(timeCellsHDate[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(timeCellsHDate[1].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(timeCellsHDate[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldHDate.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide time: Invalid if one cell is blank and the rest are filled out', function(done) {
    var cell0Input = Polymer.dom(dateCellsHTime[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCellsHTime[1].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCellsHTime[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(fieldHTime.root).querySelector('#fieldWrapper');
      assert.isTrue(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Valid if all cells have a value', function(done) {
    var cell0Input = Polymer.dom(dateCells[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCells[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(dateCells[2].root).querySelectorAll('#dtEntry'),
        cell3Input = Polymer.dom(timeCells[0].root).querySelectorAll('#dtEntry'),
        cell4Input = Polymer.dom(timeCells[1].root).querySelectorAll('#dtEntry');
        cell5Input = Polymer.dom(timeCells[2].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    cell3Input[0].value = "11";
    cell4Input[0].value = "11";
    cell5Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(timeCells[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide date: Valid if all cells have a value', function(done) {
    var cell0Input = Polymer.dom(timeCellsHDate[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(timeCellsHDate[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(timeCellsHDate[2].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(timeCellsHDate[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });

  test('Hide time: Valid if all cells have a value', function(done) {
    var cell0Input = Polymer.dom(dateCellsHTime[0].root).querySelectorAll('#dtEntry'),
        cell1Input = Polymer.dom(dateCellsHTime[1].root).querySelectorAll('#dtEntry'),
        cell2Input = Polymer.dom(dateCellsHTime[2].root).querySelectorAll('#dtEntry');

    cell0Input[0].value = "11";
    cell1Input[0].value = "11";
    cell2Input[0].value = "11";
    MockInteractions.pressAndReleaseKeyOn(dateCellsHTime[1], 13, [], 'Enter');

    flush(function() {
      var wrapper = Polymer.dom(field.root).querySelector('#fieldWrapper');
      assert.isFalse(wrapper.classList.contains('validation-failed'), "Has validation-failed class");
      done();
    });
  });
});
